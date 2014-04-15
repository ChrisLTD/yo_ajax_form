test( 'Test setup', function() {
  var $fixture = $('#qunit-fixture');
  var $formTest = $('#form-test', $fixture);
  $formTest.YoAjaxForm();

  ok( $formTest.hasClass('yoajaxform-inited'), 'Initalized properly' );
});

test( 'Test validations', function() {
  var $fixture = $('#qunit-fixture');
  var $formTest = $('#form-test', $fixture);

  // empty data value added
  $formTest.prepend('<input type="hidden" data-value="" data-validate-value-presence="We need a data-value">');  

  $formTest.YoAjaxForm();
  $formTest.trigger('submit');

  ok( ($formTest.find('.error-message-validate-presence').length > 0), 'validate presence working' );
  ok( ($formTest.find('.error-message-validate-email').length > 0), 'validate email working' );
  ok( ($formTest.find('.error-message-validate-checked').length > 0), 'validate checkbox working' );
  ok( ($formTest.find('.error-message-validate-value-presence').length > 0), 'validate data-value working' );
});