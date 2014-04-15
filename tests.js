test( 'Setup', function() {
  var $fixture = $('#qunit-fixture');
  var $formTest = $('#form-test', $fixture);
  $formTest.YoAjaxForm({'formUrl':'testresponse.json'});

  ok( $formTest.hasClass('yoajaxform-inited'), 'Initalized properly' );
});

test( 'Validations', function() {
  var $fixture = $('#qunit-fixture');
  var $formTest = $('#form-test', $fixture);

  // empty data value added
  $formTest.prepend('<input type="hidden" data-value="" data-validate-value-presence="We need a data-value">');  

  $formTest.YoAjaxForm({'formUrl':'testresponse.json'});
  $formTest.trigger('submit');

  ok( ($formTest.find('.error-message-validate-presence').length > 0), 'validate presence working' );
  ok( ($formTest.find('.error-message-validate-email').length > 0), 'validate email working' );
  ok( ($formTest.find('.error-message-validate-checked').length > 0), 'validate checkbox working' );
  ok( ($formTest.find('.error-message-validate-value-presence').length > 0), 'validate data-value working' );
});

test( 'Removing error messages', function() {
  var $fixture = $('#qunit-fixture');
  var $formTest = $('#form-test', $fixture);

  // empty data value added
  $formTest.prepend('<input type="hidden" data-value="" data-validate-value-presence="We need a data-value">');  

  $formTest.YoAjaxForm({'formUrl':'testresponse.json'});
  $formTest.trigger('submit'); // generate error messages as per the 'Validations' test

  // add valid data
  $formTest.find('[data-validate-value-presence]').data('value', 'we have data');
  $formTest.find('[data-validate-presence]').val('we have values');
  $formTest.find('[data-validate-email]').val('test@test.com');
  $formTest.find('[data-validate-checked]').click();
  $formTest.trigger('submit'); // resubmit to remove messages

  equal( $formTest.find('.error-message-validate-value-presence').length, 0, 'data-value error messages being removed' );
  equal( $formTest.find('.error-message-validate-presence').length, 0, 'presence error messages being removed' );
  equal( $formTest.find('.error-message-validate-email').length, 0, 'email error messages being removed' );
  equal( $formTest.find('.error-message-validate-checked').length, 0, 'checked error messages being removed' );
});

test( 'Email validation', function() {
  var $fixture = $('#qunit-fixture');
  var $formTest = $('#form-test', $fixture);

  $formTest.YoAjaxForm({'formUrl':'testresponse.json'});

  $formTest.find('[data-validate-email]').val('name');
  $formTest.trigger('submit')
  ok( ($formTest.find('.error-message-validate-email').length > 0), 'missing @, domain and extension' );

  $formTest.find('[data-validate-email]').val('name@');
  $formTest.trigger('submit')
  ok( ($formTest.find('.error-message-validate-email').length > 0), 'missing domain and extension' );

  $formTest.find('[data-validate-email]').val('@doman.com');
  $formTest.trigger('submit')
  ok( ($formTest.find('.error-message-validate-email').length > 0), 'missing name' );

  $formTest.find('[data-validate-email]').val('name@test');
  $formTest.trigger('submit')
  ok( ($formTest.find('.error-message-validate-email').length > 0), 'missing extension' );

  $formTest.find('[data-validate-email]').val('name@test.com');
  $formTest.trigger('submit')
  ok( ($formTest.find('.error-message-validate-email').length == 0), 'all good' );

  $formTest.find('[data-validate-email]').val('na.m+e@te.st.com');
  $formTest.trigger('submit')
  ok( ($formTest.find('.error-message-validate-email').length == 0), 'should handle multiple dots and pluses' );
});