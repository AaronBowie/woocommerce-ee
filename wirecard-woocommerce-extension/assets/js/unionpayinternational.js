/**
 * Shop System Plugins - Terms of Use
 *
 * The plugins offered are provided free of charge by Wirecard AG and are explicitly not part
 * of the Wirecard AG range of products and services.
 *
 * They have been tested and approved for full functionality in the standard configuration
 * (status on delivery) of the corresponding shop system. They are under General Public
 * License version 3 (GPLv3) and can be used, developed and passed on to third parties under
 * the same terms.
 *
 * However, Wirecard AG does not provide any guarantee or accept any liability for any errors
 * occurring when used in an enhanced, customized shop system configuration.
 *
 * Operation in an enhanced, customized configuration is at your own risk and requires a
 * comprehensive test phase by the user of the plugin.
 *
 * Customers use the plugins at their own risk. Wirecard AG does not guarantee their full
 * functionality neither does Wirecard AG assume liability for any disadvantages related to
 * the use of the plugins. Additionally, Wirecard AG does not guarantee the full functionality
 * for customized shop systems or installed plugins of other vendors of plugins within the same
 * shop system.
 *
 * Customers are responsible for testing the plugin's functionality before starting productive
 * operation.
 *
 * By installing the plugin into the shop system the customer agrees to these terms of use.
 * Please do not use the plugin if you do not agree to these terms of use!
 */
var token         = null;
var checkout_form = jQuery( "form.checkout" );
var processing    = false;
$                 = jQuery;

/**
 * Display error massages
 *
 * @since 1.1.0
 */
function logCallback( response ) {
	console.error( response );
}

/**
 * Resize the unionpayinternational form when loaded
 *
 * @since 1.1.0
 */
function resizeUpiIframe() {
	$( "#wc_payment_method_wirecard_unionpayinternational_form > iframe" ).height( 550 );
}

/**
 * Render the unionpayinternational form
 *
 * @since 1.1.0
 */
function renderUpiForm( request_data ) {
	/* global WirecardPaymentPage b:true */
	WirecardPaymentPage.seamlessRenderForm(
		{
			requestData: request_data,
			wrappingDivId: "wc_payment_method_wirecard_unionpayinternational_form",
			onSuccess: resizeUpiIframe,
			onError: logCallback
		}
	);
}

/**
 * Get data required to render the form
 *
 * @since 1.1.0
 */
function getUpiRequestData() {
	$.ajax(
		{
			type: "POST",
			/* global upi_vars b:true */
			url: upi_vars.ajax_url,
			data: { "action" : "get_upi_request_data" },
			dataType: "json",
			success: function (data) {
				renderUpiForm( JSON.parse( data.data ) );
			},
			error: function (data) {
				logCallback( data );
			}
		}
	);
}

/**
 * Add the tokenId to the submited form
 *
 * @since 1.1.0
 */
function formSubmitUpiSuccessHandler( response ) {
	token = response.token_id;
	jQuery( "<input>" ).attr(
		{
			type: "hidden",
			name: "tokenId",
			id: "tokenId",
			value: token
		}
	).appendTo( checkout_form );

	checkout_form.submit();
}

jQuery( document ).ajaxComplete(
	function() {
		if ( $( "#wc_payment_method_wirecard_unionpayinternational_form" ).is( ":visible" ) ) {
			getUpiRequestData();
		}

		$( "input[name=payment_method]" ).change(
			function() {
				if ( $( this ).val() === "wirecard_ee_unionpayinternational" ) {
					getUpiRequestData();
					return false;
				}
			}
		);

		/**
	 * Submit the seamless form before order is placed
	 *
	 * @since 1.1.0
	 */
		checkout_form.on(
			"checkout_place_order",
			function() {
				if ( $( "#payment_method_wirecard_ee_unionpayinternational" )[0].checked === true && processing === false ) {
					processing = true;
					if ( token ) {
						return true;
					} else {
						/* global WirecardPaymentPage b:true */
						WirecardPaymentPage.seamlessSubmitForm(
							{
								onSuccess: formSubmitUpiSuccessHandler,
								onError: logCallback,
								wrappingDivId: "wc_payment_method_wirecard_unionpayinternational_form"
							}
						);
						return false;
					}
				}
				processing = false;
			}
		);
	}
);
