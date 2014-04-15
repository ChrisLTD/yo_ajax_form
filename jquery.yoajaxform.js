// Script by Chris Johnson
// http://chrisltd.com
// Created April 2014
// Version .01
// jQuery plugin to handle validating and submitting ajax forms

(function( $ ){

  $.fn.YoAjaxForm = function( options ) {  

    // CREATE SOME DEFAULTS, EXTENDING THEM WITH ANY OPTIONS THAT WERE PROVIDED
    var settings = $.extend( {
      'showErrors'            : true,                               // show or hide errors
      'errorClass'            : 'error',                            // class applied to inputs that fail validation
      'errorMessageClass'     : 'error-message',                    // class of validation error messages
      'formAction'            : 'POST',                             // GET or POST
      'formUrl'               : 'http://google.com',                // form url
      'additionalData'        : 'q=foobar',                         // extra form data passed along              
      'postAction'            : 'post_subscribe',                   // ajax action
      'beforeAjaxCallback'    : function(postDataString) {},        // called immediately before ajax request
      'successTest'           : function(data) { return true },     // called to test the success of the ajax request, should return something truthy if successful
      'validCallback'         : function($form) {},                 // called if form is valid 
      'invalidCallback'       : function($form) {},                 // called if form is invalid 
      'initCallback'          : function() {},                      // called if plugin initialized on an object
      'successCallback'       : function(data) {},                  // called if form is successfully submitted
      'failureCallback'       : function(data) {},                  // called if form submission fails
      'errorCallback'         : function(data, status, error) {},   // called if the ajax call fails
      'alwaysCallback'        : function(data, status) {}           // called if the ajax call fails
    }, options);

    // GLOBAL VARIABLES
    var obj = this;
    var $form = $( this );
    var canSubmit = true;
    
    // BIND ACTION

    $form.on('submit', function(event) {
      event.preventDefault();
      if( !canSubmit ){
        return;
      }
      if( validateForm( $form ) ){
        subscribe_ajax();
        settings.validCallback( $form );
      } else {
        settings.invalidCallback( $form );
      }
    });

    // FUNCTIONS
    function validateForm( $form ){
      var validated = [];

      // Check for the different data validation fields, validate them in turn, return true or false
      var presenceFieldsDataName = '[data-validate-presence]';              // check to see if any value is input
      var presenceValueFieldsDataName = '[data-validate-value-presence]';   // check to see if any pseudo data-value exists
      var emailFieldsDataName = '[data-validate-email]';                    // check for a valid email address 
      var checkedFieldsDataName = '[data-validate-checked]';                // check checked checkbox

      var $presenceFields = $(presenceFieldsDataName, $form);
      var $presenceValueFields = $(presenceValueFieldsDataName, $form);
      var $emailFields = $(emailFieldsDataName, $form);
      var $checkedFields = $(checkedFieldsDataName, $form);

      // Process each validatable field, return results to single array
      validated += $presenceFields.map( function(){ return validatePresence(this, presenceFieldsDataName); } ).get();
      validated += $presenceValueFields.map( function(){ return validateValuePresence(this, presenceValueFieldsDataName); } ).get();
      validated += $emailFields.map( function(){ return validateEmail(this, emailFieldsDataName); } ).get();
      validated += $checkedFields.map( function(){ return validateChecked(this, checkedFieldsDataName); } ).get();

      // Check results array for false validation
      if(validated.indexOf(false) >= 0){
        return false;
      }
      return true;
    }

    function validatePresence(_this, dataName){
      var result = null;
      var $this = $(_this);
      if( $this.val() !== '' ){
        result = true;
      } else {
        result = false;
      }
      displayErrors($this, result, dataName);
      return result;
    }

    function validateEmail(_this, dataName){
      var result = null;
      var $this = $(_this);
      var regex = /.+@.+\..+/;
      var _value = $this.val();
      if( regex.exec( _value ) ){
        result = true;
      } else {
        result = false;
      }
      displayErrors($this, result, dataName);
      return result;
    }
    
    function validateValuePresence(_this, dataName){
      var result = null;
      var $this = $(_this);
      if( $this.data('value') !== '' ){
        result = true;
      } else {
        result = false;
      }
      displayErrors($this, result, dataName);
      return result;
    }

    function validateChecked(_this, dataName){
      var result = null;
      var $this = $(_this);
      if( $this.is(':checked') || $this.hasClass('checked') ){
        result = true;
      } else {
        result = false;
      }
      displayErrors($this, result, dataName);
      return result;
    }
    
    function displayErrors($this, result, dataName){
      if( !settings.showErrors ){
        return;
      }
      $this.removeClass( settings.errorClass );
      $this.next('.' + settings.errorMessageClass).remove();
      if( !result ){
        var dataAttribute = dataName.substr(6);
        dataAttribute = dataAttribute.substr(0, dataAttribute.length-1);
        $this.after('<span class="' + settings.errorMessageClass + ' ' + settings.errorMessageClass + '-' + dataAttribute + '">' + $this.data(dataAttribute) + '</span>');
        $this.addClass( settings.errorClass );
      }
    }

    function showForm(){
      $form.show();
    }

    function subscribe_ajax(){
      var postDataMap = {};
      var postDataString = '';

      canSubmit = false;

      // Get all the form values
      $form.find('input, textarea').not('[type="checkbox"]').each(function(index, Element) {
        var $this = $(this);
        var val = $this.val();
        // If we have a pseudo value, use that instead
        if( $this.data('value') && $this.data('value') != '' ){
          val = $this.data('value');
        }
        postDataMap[$this.attr('name')] = val; 
      });

      $form.find('input[type="checkbox"]').each(function(index, Element) {
        var $this = $(this);
        if( !$this.is(':checked') ){
          return;
        }
        var val = $this.val();
        postDataMap[$this.attr('name')] = val; 
      });

      $.each(postDataMap, function(index, Element) {
        postDataString += index + '=' + encodeURI(Element) + '&';
      });

      settings.beforeAjaxCallback(postDataString);

      var xhr = $.ajax({
          type: settings.formAction,
          url:  settings.formUrl,
          data: postDataString + '&' + settings.additionalData
      })
      .done(function(data){
         if( settings.successTest(data) ){
           settings.successCallback(data);
         } else {
           settings.failureCallback(data);
         }
      })
      .fail(function(data, status, error){
        settings.errorCallback(data, status, error);
      })
      .always(function(data, status){
        canSubmit = true;
        settings.alwaysCallback(data, status);  
      });
    }

    // INITIALIZED
    $form.addClass('yoajaxform-inited');
    settings.initCallback();

    return this;
  };
})( jQuery );