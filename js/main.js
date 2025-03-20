/**
 * Required vars:
 *      - estado_mayorista
 *      - uri
 *      - categorias_flatten
 *      - pago_online
 *      - products_feed
 *      - product_common
 */

var navbar = $('.header-menu');
var sticky = navbar.offset().top;
var header_announcement = $('.header-announcement');
var sitekey = '6LfXRycUAAAAAFQF69mKvgHerNR9oDrDYw1BM_Kw';
var csrf_token = $('meta[name="csrf-token"]').attr('content');
var cdn = get_cloudfront_url('productos'); 

var login_captcha = null;
var register_captcha = null;
var recover_captcha = null;
var wholesaler_captcha = null;
var contact_captcha = null;
var newsletter_captcha = null;
var regret_captcha = null;

window.onscroll = function() { 
    stickyNavbar(); 
    searchPush();
}
function stickyNavbar() 
{
    if(window.pageYOffset > sticky)
    {
        if($('.nav.first > li').length<=10 || $('body').width()<=960)
        {
            if(navbar.attr('class') !== 'header-menu header-menu--sticky')
            {
                navbar.attr('class', 'header-menu header-menu--sticky');
                $('.header-search__wrapper').addClass('header-search__wrapper--sticky');
            }
        }
        else
        {
            if(navbar.attr('class') !== 'header-menu')
            {
                navbar.attr('class', 'header-menu');
                $('.header-search__wrapper').removeClass('header-search__wrapper--sticky');
            }
        }
    } 
    else 
    {
        if(navbar.attr('class') !== 'header-menu')
        {
            navbar.attr('class', 'header-menu');
            $('.header-search__wrapper').removeClass('header-search__wrapper--sticky');
        }
    }
}
function searchPush()
{
    if(header_announcement.length)
    {
        if(window.pageYOffset > header_announcement.offset().top)
        {
            $('.header-search').removeAttr('style');
        }
        else
        {
            $('.header-search').attr('style','top: '+header_announcement.height()+'px')
        }
    }
}

function product_item(producto, product_css_prefix)
{
    var p_producto = product_get_params(producto, estado_mayorista, categorias_flatten, uri);
    
    var html = '';
    html += '<div class="'+product_css_prefix+'-wrapper">';
    html += '<div class="'+product_css_prefix+'-media">';
    html += '<a href="'+p_producto.link_producto+'" class="'+product_css_prefix+'-link">';
    if(p_producto.sale_off)
    {
        html += '<span class="'+product_css_prefix+'-offer background--primary contrast_text--primary">';
        html += p_producto.sale_off+'% OFF';
        html += '</span>';
    }
    if(!p_producto.stock)
    {
        html += '<span class="'+product_css_prefix+'-out-stock">';
        html += product_common.out_of_stock;
        html += '</span>';
    }
    html += '<img class="'+product_css_prefix+'-image" src="'+cdn+producto.imagenes[0].i_link+'" alt="Producto - '+producto.p_nombre+'"/>';
    html += '</a>';
    html += '</div>';
    html += '<h3 class="'+product_css_prefix+'-name text--primary">';
    html += '<a href="'+p_producto.link_producto+'">';
    html += producto.p_nombre;
    html += '</a>';
    html += '</h3>';
    if(p_producto.precio)
    {
        html += '<p class="'+product_css_prefix+'-price text--primary">';
        if(p_producto.precio_anterior)
        {
            html += '<del>'+number_format(p_producto.precio_anterior)+'</del>'; 
        }
        html += number_format(p_producto.precio);
        html += '</p>';
    }
    if(pago_online)
    {
        if(products_feed.product_subtext_type===0)
        {
            html += '<p class="'+product_css_prefix+'-additional text--primary">';
            html += products_feed.product_subtext;
            html + '</p>';
        }
        else if(products_feed.product_subtext_type==1 && p_producto.precio)
        {
            html += '<p class="'+product_css_prefix+'-additional text--primary">';
            html += get_parameterized_lang_string(product_common.list_installments, {
                installments: products_feed.product_subtext_cuotas,
                amount: number_format(p_producto.precio / products_feed.product_subtext_cuotas)
            });
            html += '</p>';
        }
    }
    if(estado_mayorista)
    {
        html += '<p class="'+product_css_prefix+'-additional text--primary">';
        html += get_parameterized_lang_string(product_common.wholesale_min_qty, {
            qty: producto.p_cantidad_minima
        });
        html += '</p>';
    }
    html += '</div>';

    return html;
}

function input(id,type,label,regex,error_message,placeholder,value,required,extra_css)
{
    var newHtml = '<div class="field field--'+id+'">';
    if(label)
    {
        newHtml += '<label class="field__label field__label--'+id+'" for="'+id+'">'+label+(required ? '' : ' (opcional)')+'</label>';
    }
    if(value)
    {
        newHtml += '<input type="'+type+'" name="'+id+'" id="'+id+'" class="field__input border-radius'+(extra_css ? ' '+extra_css : '')+'" value="'+value+'" data-regex="'+regex+'" data-message="'+error_message+'" '+(placeholder ? 'placeholder="'+placeholder+'"' : '')+(required ? 'data-required="1"' : 'data-required="0"')+'/>';
    }
    else
    {
        newHtml += '<input type="'+type+'" name="'+id+'" id="'+id+'" class="field__input border-radius'+(extra_css ? ' '+extra_css : '')+'" data-regex="'+regex+'" data-message="'+error_message+'" '+(placeholder ? 'placeholder="'+placeholder+'"' : '')+(required ? 'data-required="1"' : 'data-required="0"')+'/>';
    }
    newHtml += '<p class="field__message field__message--'+id+'"></p>';
    newHtml += '</div>';
    return newHtml;
}
function button(id,label,size,type,disabled,loading,show,width,extra,extra_css)
{
    var ratio;
    switch(size)
    {
        case 'small':
            ratio = "0.5"; 
        break;
        case 'normal':
            ratio = "0.75";  
        break;
        case 'input':
            ratio = "0.75";  
        break;
        case 'large':
            ratio = "1"; 
        break;
    }
    extra_css = extra_css === '' ? '' : ' '+extra_css;
    extra_css += (loading || disabled) ? ' button--inactive' : '';
    extra_css += show ? '' : ' button--hidden';
    extra_css += width ? ' button--'+width : '';

    var newHtml = '<button type="'+type+'" id="'+id+'" class="button'+extra_css+' background--primary background--primary-hover contrast_text--primary contrast_text--primary-hover uk-button uk-button-'+size+' border-radius" '+(disabled ? 'disabled' : '')+' data-label="'+label+'" data-spinner-ratio="'+ratio+'" '+extra+'>';
    if(loading)
    {
        newHtml += '<div uk-spinner="ratio: '+ratio+'"></div>';
    }
    else
    {
        newHtml += label;
    }
    newHtml += '</button>';
    return newHtml;
}

//cart
var ca_carrito;
var ca_carrito_enable_cp_edit = false;
function get_cart()
{
    $('.cart-sidenav__loader').show();
    $.ajax({
        headers: {
            'X-CSRF-TOKEN': csrf_token
        },
        url: "/v4/cart",
        dataType: "JSON",
        method: "GET",
        cache: false
    }).done(function(resp) {
        var ca_carrito_new = resp.data;
        build_cart(ca_carrito_new, open_cart, []);
    }).fail(function(err) {
        var resp = err.responseJSON;
        $('.cart-sidenav__loader').hide();
        if(resp && resp.message)
        {
            error($('.cart-sidenav__msg'), resp.message.description);
        }
    });
}
function build_single_shipping_cart_option(option, envio_seleccionado)
{
    var price_obj = format_shipment_price(option);
    var days_obj = format_shipment_days(option);
    var image = 'https://dk0k1i3js6c49.cloudfront.net/iconos-envio/costo-envio/'+option.icono;
    var newHtml = '<li class="cart-sidenav__shipment-result-list-item">';
    newHtml += '<div class="uk-grid-collapse uk-flex-middle" uk-grid>';
    newHtml += '<div class="uk-width-auto">';
    newHtml += '<label for="shipment_option_radio-'+option.position+'">';
    if(option.position === envio_seleccionado)
    {
        newHtml += '<input type="radio" name="shipment_option_radio" class="shipment_option_radio with-gap" value="'+option.position+'" id="shipment_option_radio-'+option.position+'" checked="checked"/><span></span>';
    }
    else
    {
        newHtml += '<input type="radio" name="shipment_option_radio" class="shipment_option_radio with-gap" value="'+option.position+'" id="shipment_option_radio-'+option.position+'"/><span></span>';
    }
    newHtml += '</label>';
    newHtml += '</div>';
    newHtml += '<div class="uk-width-expand">';
    newHtml += '<div class="uk-flex uk-flex-middle">';
    newHtml += '<div class="cart-sidenav__shipment-result-item-image-wrapper">';
    newHtml += '<label for="shipment_option_radio-'+option.position+'">';
    newHtml += '<img src="'+image+'" class="cart-sidenav__shipment-result-item-image">';
    newHtml += '</label>';
    newHtml += '</div>';
    newHtml += '<div class="cart-sidenav__shipment-result-item-info-wrapper">';
    newHtml += '<p class="cart-sidenav__shipment-result-item-info-title">';
    newHtml += '<label for="shipment_option_radio-'+option.position+'">';
    newHtml += option.nombre;
    newHtml += '</label>';
    newHtml += '</p>';
    if(price_obj.label)
    {
        newHtml += '<p class="cart-sidenav__shipment-result-item-info-price">';
        newHtml += '<label for="shipment_option_radio-'+option.position+'">';
        newHtml += '<span class="cart-sidenav__shipment-result-item-info-price-wrapper">'+price_obj.label+'</span>';
        if(days_obj.label)
        {
            newHtml += ' - '+days_obj.label;
            newHtml += ' <span class="cart-sidenav__shipment-result-item-info-after">('+days_obj.after+')</span>';
        }
        newHtml += '</label>';
        newHtml += '</p>';
    }
    if(option.descripcion.length)
    {
        newHtml += '<p class="cart-sidenav__shipment-result-item-info-description">';
        newHtml += '<label for="shipment_option_radio-'+option.position+'">';
        newHtml += option.descripcion.join(' - ');
        newHtml += '</label>';
        newHtml += '</p>';
    }
    newHtml += '</div>';
    newHtml += '</div>';
    newHtml += '</div>';
    newHtml += '</div>';
    newHtml += '</li>';
    return newHtml;
}
function build_shipping_cart_options(key, envios_format, envio_seleccionado, in_other_office)
{
    var newHtml = '';
    if(envios_format[key].featured.length)
    {
        newHtml += '<div>';
        newHtml += '<p class="cart-sidenav__shipment-result-group-title">';
        newHtml += product_common['shipment_'+key];
        newHtml += '</p>';
        newHtml += '<ul class="cart-sidenav__shipment-result-list cart-sidenav__shipment-result-list--'+key+' border-radius">';

        envios_format[key].featured.forEach(function(option){
            newHtml += build_single_shipping_cart_option(option, envio_seleccionado);
        });
        if(in_other_office && key==='office')
        {
            envios_format[key].others.forEach(function(option){
                newHtml += build_single_shipping_cart_option(option, envio_seleccionado);
            });
        }
        newHtml += '</ul>';

        if(envios_format[key].others.length && !in_other_office)
        {
            newHtml += '<p class="cart-sidenav__shipment-result-item-show-more"><a href="#" class="cart-sidenav__shipment-result-item-show-more-link" data-key="'+key+'">'+product_common.shipment_office_show_more+' <span uk-icon="chevron-down"></span></a></p>';
        }

        newHtml += '</div>';
    }
    return newHtml;
}
function build_cart(ca_carrito_new, open_side, errors)
{
    ca_carrito = ca_carrito_new;
    var productos = ca_carrito.productos;
    var subtotal = 0;
    var total = 0;
    var cantidad = 0;
    var html = '';
    
    $('.cart-sidenav__loader').show();
    $('.cart-sidenav__msg').html('');

    if(open_side) UIkit.offcanvas('#cart-sidenav').show();

    for(idStock in productos)
    {
        var producto = productos[idStock];
        var precio_item = producto.precio_unitario * producto.cantidad;
        subtotal += precio_item;
        cantidad += 1;

        if(cantidad===1)
        {
            html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
        }
        html += '<li class="cart-sidenav__item">';
        html += '<div class="cart-sidenav__left">';
        html += '<img src="'+cdn+producto.img+'" class="cart-sidenav__product-image"/>';
        html += '<div class="cart-sidenav__product-info">';
        html += '<p class="cart-sidenav__product-title">'+producto.nombre+'</p>';
        html += '<p class="cart-sidenav__product-subtitle">';
        for(var i in producto.info_atributos)
        {
            var atributos_keys = Object.keys(producto.info_atributos);
            var atributo = producto.info_atributos[i];
            if(parseInt(i)===parseInt(atributos_keys[atributos_keys.length-1]))
            {
                html += atributo.at_nombre+': '+atributo.vat_valor;
            }
            else
            {
                html += atributo.at_nombre+': '+atributo.vat_valor+' - ';
            }
        }
        html += '</p>';
        html += '<div class="cart-sidenav__product-qty-container">';
        html += '<button class="cart-sidenav__product-qty-button'+(producto.cantidad===1 ? ' cart-sidenav__product-qty-button--disabled': '')+'" data-action="remove" data-stk="'+idStock+'" data-product="'+producto.id+'"><i class="fas fa-minus"></i></button>';
        html += '<span class="cart-sidenav__product-qty">'+producto.cantidad+'</span>';
        html += '<button class="cart-sidenav__product-qty-button" data-action="add" data-stk="'+idStock+'" data-product="'+producto.id+'"><i class="fas fa-plus"></i></button>';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        html += '<div class="cart-sidenav__right">';
        html += '<p class="cart-sidenav__product-price">'+number_format(precio_item)+'</p>';
        html += '<button class="cart-sidenav__product-delete-button" data-stk="'+idStock+'" data-product="'+producto.id+'"><i class="fas fa-trash"></i></button>';
        html += '</div>';
        html += '</li>';
    }

    if(cantidad===0)
    {
        html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
        html += '<li class="cart-sidenav__item cart-sidenav__item--centered">';
        html += '<p class="cart-sidenav__info-text uk-text-center">'+cart_labels.sidenav_empty_cart+'</p>';
        html += '<a href="#" class="cart-sidenav__button-link" uk-toggle="target: #cart-sidenav">'+cart_labels.sidenav_back_shop+'</a>';
        html += '</li>';
    }

    //subtotal
    if(cantidad>0)
    {
        html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
        html += '<li class="cart-sidenav__item cart-sidenav__item--detail">';
        html += '<div class="cart-sidenav__left">';
        html += '<p class="cart-sidenav__detail-title">'+cart_labels.sidenav_subtotal+'</p>';
        html += '</div>';
        html += '<div class="cart-sidenav__right">';
        html += '<p class="cart-sidenav__detail-price">'+number_format(subtotal)+'</p>';
        html += '</div>';
        html += '</li>';
        
        total = subtotal;

        //envios
        var envio = ca_carrito.envio;
        if(envio.requerido)
        {
            if(envio.codigo_postal && !ca_carrito_enable_cp_edit)
            {
                html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
                html += '<li class="cart-sidenav__item cart-sidenav__item--detail">';
                html += '<div class="cart-sidenav__left">';
                html += '<div class="cart-sidenav__left-wrapper">';
                html += '<p class="cart-sidenav__detail-title">'+cart_labels.sidenav_shipment_list_title+'</p>';
                html += '<p class="cart-sidenav__shipment-zip-code">CP '+envio.codigo_postal+'</p>';
                html += '</div>';
                html += '</div>';
                html += '<div class="cart-sidenav__right">';
                html += '<p class="cart-sidenav__detail-action"><a href="#" class="change_shipment-btn">'+cart_labels.sidenav_shipment_list_change_zip_code+'</a></p>';
                html += '</div>';
                html += '</li>';
                
                //cargo los metodos de envio
                var envios = envio.envios_disponibles;
                var envios_format_obj = sort_shipping_cart_options(envio.envios_disponibles, envio.envio_seleccionado);
                var in_other_office = envios_format_obj.in_other_office;
                var envios_format = envios_format_obj.options;

                if(envios.length>0)
                {
                    html += '<li class="cart-sidenav__item">';
                    html += '<div class="cart-sidenav_shipment-results uk-grid-small uk-child-width-1-1" uk-grid>';
                    html += build_shipping_cart_options('domicile', envios_format, envio.envio_seleccionado, in_other_office);
                    html += build_shipping_cart_options('office', envios_format, envio.envio_seleccionado, in_other_office);
                    html += build_shipping_cart_options('other', envios_format, envio.envio_seleccionado, in_other_office);
                    html += build_shipping_cart_options('point', envios_format, envio.envio_seleccionado, in_other_office);
                    html += '</div>';
                    html += '</li>';
    
                    var envio_seleccionado = format_shipment_price(envios[envio.envio_seleccionado]);
                    total = total + envio_seleccionado.price;
                    if(envios[envio.envio_seleccionado].tipo !== 3)
                    {      
                        html += '<li class="cart-sidenav__item cart-sidenav__item--detail">';
                        html += '<div class="cart-sidenav__left">';
                        html += '<p class="cart-sidenav__detail-title">'+cart_labels.sidenav_shipment+'</p>';
                        html += '</div>';
                        html += '<div class="cart-sidenav__right">';
                        html += '<p class="cart-sidenav__detail-price">'+envio_seleccionado.label_detail+'</p>';
                        html += '</div>';
                        html += '</li>';
                    }
                }
            }
            else
            {
                html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
                html += '<li class="cart-sidenav__item cart-sidenav__item--detail">';
                html += '<form method="POST" id="search_shipments-form">';
                html += '<p class="cart-sidenav__detail-title"><a href="#" class="search_shipments-toggle uk-flex uk-flex-between uk-flex-middle"><span>'+cart_labels.sidenav_shipment_title+'</span><span class="search_shipments-icon" uk-icon="chevron-down"></span></a></p>';
                html += '<div class="search_shipments-grid uk-grid-collapse" style="display: none;" uk-grid>';
                if(alerta_envio)
                {
                    html += '<div class="uk-width-1-1 uk-margin">';
                    html += alert_message('info', '<span uk-icon="icon: info; ratio: 0.9;"></span> <span class="cart-sidenav__alert-text">'+alerta_envio_mensaje+'</span>');
                    html += '</div>';
                }
                html += '<div class="uk-width-3-5">';
                html += input('search_shipments-zip_code', 'text', '', fields.zip_code.regex, fields.zip_code.error_message, fields.zip_code.placeholder, envio.codigo_postal, true, 'field__input--right-button');
                html += '</div>';
                html += '<div class="uk-width-2-5">';
                html += button('search_shipments-btn', cart_labels.sidenav_shipment_button, 'input', 'submit', false, false, true, 'full', '', 'uk-button-input--no-radius uk-button-input-outline');
                html += '</div>';
                html += '</div>';
                html += '</form>';
                html += '</li>';
            }
        }
        ca_carrito_enable_cp_edit = false;

        //cupon
        if(parseInt(cupones_descuento))
        {
            var cupon = ca_carrito.cupon;
            if(cupon.id)
            {
                total = total - cupon.monto_descuento;

                html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
                html += '<li class="cart-sidenav__item cart-sidenav__item--detail">';
                html += '<div class="cart-sidenav__left">';
                html += '<div class="cart-sidenav__left-wrapper">';
                html += '<p class="cart-sidenav__detail-title">'+cart_labels.sidenav_coupon+'</p>';
                html += '<p class="cart-sidenav__detail-action"><a href="#" class="remove_coupon-btn">'+cart_labels.sidenav_coupon_remove_button+'</a></p>';
                html += '</div>';
                html += '</div>';
                html += '<div class="cart-sidenav__right">';
                html += '<p class="cart-sidenav__detail-price">-'+number_format(cupon.monto_descuento)+'</p>';
                html += '</div>';
                html += '</li>';
            }
            else
            {
                html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
                html += '<li class="cart-sidenav__item cart-sidenav__item--detail">';
                html += '<form method="POST" id="add_coupon-form">';
                html += '<p class="cart-sidenav__detail-title"><a href="#" class="uk-flex uk-flex-between uk-flex-middle add_coupon-toggle"><span>'+cart_labels.sidenav_coupon_add_title+'</span><span class="add_coupon-icon" uk-icon="chevron-down"></span></a></p>';
                html += '<div class="add_coupon-grid uk-grid-collapse" style="display: none;" uk-grid>';
                html += '<div class="uk-width-3-5">';
                html += input('add_coupon-coupon', 'text', '', fields.discount_code.regex, fields.discount_code.error_message, fields.discount_code.placeholder, '', true, 'field__input--right-button');
                html += '</div>';
                html += '<div class="uk-width-2-5">';
                html += button('add_coupon-btn', cart_labels.sidenav_coupon_button, 'input', 'submit', false, false, true, 'full', '', 'uk-button-input--no-radius uk-button-input-outline');
                html += '</div>';
                html += '</div>';
                html += '</form>';
                html += '</li>';
            }
        }
    
        //total
        html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
        html += '<li class="cart-sidenav__item cart-sidenav__item--detail">';
        html += '<div class="cart-sidenav__left">';
        html += '<p class="cart-sidenav__detail-title">'+cart_labels.sidenav_total+'</p>';
        html += '</div>';
        html += '<div class="cart-sidenav__right">';
        html += '<p class="cart-sidenav__detail-price">'+number_format(total)+'</p>';
        html += '</div>';
        html += '</li>';
        
        html += '<li class="cart-sidenav__item cart-sidenav__item--divider"><div class="cart-sidenav__divider"></div></li>';
        html += '<li class="cart-sidenav__item cart-sidenav__item--button-area">';
        html += button('start_checkout-btn', cart_labels.sidenav_checkout_start_button, 'large', 'button', false, false, true, 'full', '', 'border-radius--full');
        html += '<a href="#" class="cart-sidenav__button-link" uk-toggle="target: #cart-sidenav">'+cart_labels.sidenav_keep_buying_button+'</a>';
        html += '</li>';
    }

    //actualizo cantidades
    $('.cart-qty').html(cantidad);
    $('.cart-price').html(number_format(total));
    
    //saco el loader
    $('.cart-sidenav__loader').hide();

    //cargo el contenido
    $('.cart-sidenav__content').html(html);

    //muestro errores si hay
    if(errors.length)
    {
        error_multiple($('.cart-sidenav__msg'), errors);
        goToSpecific($('.cart-sidenav__offcanvas-bar'), 300);
    }
}
//end cart

$(function(){

    //input validation
    $(document).on('blur', '.field__input, .field__textarea', function(){
        var field = $(this);
        setTimeout(function(){
            validate_field(field);
        },20);
    });
    //end input validation

    //cart
    get_cart();
    $('.cart-sidenav__content').on('click', '.cart-sidenav__product-qty-button', function(e){
        e.preventDefault();
        $('.cart-sidenav__loader').show();
        var action = $(this).attr('data-action');
        var stock = $(this).attr('data-stk');
        var product = $(this).attr('data-product');
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            url: "/v4/cart/qty",
            dataType: "JSON",
            method: "POST",
            data: {
                action: action,
                stock: stock,
                product: product
            }
        }).done(function(resp){
            var errors = resp.message.description;
            var ca_carrito_new = resp.data;
            build_cart(ca_carrito_new, false, errors);
        }).fail(function(err){
            var resp = err.responseJSON;
            if(resp && resp.message)
            {
                var code = resp.message.code;
                if(code)
                {
                    var errors = resp.message.description;
                    var ca_carrito_new = resp.data;
                    build_cart(ca_carrito_new, false, errors);
                }
                else
                {
                    build_cart(ca_carrito, false, [resp.message.description]);
                }
            }
            else
            {
                build_cart(ca_carrito, false, []);
            }        
        });
    });
    $('.cart-sidenav__content').on('click', '.cart-sidenav__product-delete-button', function(e){
        e.preventDefault();
        $('.cart-sidenav__loader').show();
        var stock = $(this).attr('data-stk');
        var product = $(this).attr('data-product');
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            url: "/v4/cart/delete",
            dataType: "JSON",
            method: "POST",
            data: {
                stock: stock,
                product: product
            }
        }).done(function(resp){
            var errors = resp.message.description;
            var ca_carrito_new = resp.data;
            build_cart(ca_carrito_new, false, errors);
        }).fail(function(err){
            var resp = err.responseJSON;
            if(resp && resp.message)
            {
                var code = resp.message.code;
                if(code)
                {
                    var errors = resp.message.description;
                    var ca_carrito_new = resp.data;
                    build_cart(ca_carrito_new, false, errors);
                }
                else
                {
                    build_cart(ca_carrito, false, [resp.message.description]);
                }
            }
            else
            {
                build_cart(ca_carrito, false, []);
            }    
        });
    });
    $('.cart-sidenav__content').on('click', '.add_coupon-toggle', function(e){
        e.preventDefault();
        $('.add_coupon-grid').toggle();
        var chevron = $('.add_coupon-icon').attr('uk-icon');
        $('.add_coupon-icon').attr('uk-icon', chevron==='chevron-down' ? 'chevron-up' : 'chevron-down');
    });
    $('.cart-sidenav__content').on('submit', '#add_coupon-form', function(e){
        e.preventDefault();
        $('.cart-sidenav__loader').show();
        if(validate_field($('#add_coupon-coupon')))
        {
            var discount_code =  $('#add_coupon-coupon').val();
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                url: "/v4/cart/add-discount",
                dataType: "JSON",
                method: "POST",
                data: {
                    discount_code: discount_code
                }
            }).done(function(resp){
                var errors = resp.message.description;
                var ca_carrito_new = resp.data;
                build_cart(ca_carrito_new, false, errors);
            }).fail(function(err){
                var resp = err.responseJSON;
                if(resp && resp.message)
                {
                    var code = resp.message.code;
                    if(code)
                    {
                        var errors = resp.message.description;
                        var ca_carrito_new = resp.data;
                        build_cart(ca_carrito_new, false, errors);
                    }
                    else
                    {
                        build_cart(ca_carrito, false, [resp.message.description]);
                    }
                }
                else
                {
                    build_cart(ca_carrito, false, []);
                }    
            });
        }
        else
        {
            $('.cart-sidenav__loader').hide();
        }
    });
    $('.cart-sidenav__content').on('click', '.remove_coupon-btn', function(e){
        e.preventDefault();
        $('.cart-sidenav__loader').show();
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            url: "/v4/cart/remove-discount",
            dataType: "JSON",
            method: "POST"
        }).done(function(resp){
            var errors = resp.message.description;
            var ca_carrito_new = resp.data;
            build_cart(ca_carrito_new, false, errors);
        }).fail(function(err){
            var resp = err.responseJSON;
            if(resp && resp.message)
            {
                var code = resp.message.code;
                if(code)
                {
                    var errors = resp.message.description;
                    var ca_carrito_new = resp.data;
                    build_cart(ca_carrito_new, false, errors);
                }
                else
                {
                    build_cart(ca_carrito, false, [resp.message.description]);
                }
            }
            else
            {
                build_cart(ca_carrito, false, []);
            } 
        });
    });
    $('.cart-sidenav__content').on('click', '.search_shipments-toggle', function(e){
        e.preventDefault();
        $('.search_shipments-grid').toggle();
        var chevron = $('.search_shipments-icon').attr('uk-icon');
        $('.search_shipments-icon').attr('uk-icon', chevron==='chevron-down' ? 'chevron-up' : 'chevron-down');
    });
    $('.cart-sidenav__content').on('submit', '#search_shipments-form', function(e){
        e.preventDefault();
        $('.cart-sidenav__loader').show();
        var zip_code =  parseInt($('#search_shipments-zip_code').val());
        if(zip_code>=1000 && zip_code<=9421)
        {
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                url: "/v4/cart/shipment-methods",
                dataType: "JSON",
                method: "GET",
                data: {
                    zip_code: zip_code
                }
            }).done(function(resp){
                var errors = resp.message.description;
                var ca_carrito_new = resp.data;
                build_cart(ca_carrito_new, false, errors);
            }).fail(function(err){
                var resp = err.responseJSON;
                if(resp && resp.message)
                {
                    var code = resp.message.code;
                    if(code)
                    {
                        var errors = resp.message.description;
                        var ca_carrito_new = resp.data;
                        build_cart(ca_carrito_new, false, errors);
                    }
                    else
                    {
                        build_cart(ca_carrito, false, [resp.message.description]);
                    }
                }
                else
                {
                    build_cart(ca_carrito, false, []);
                }    
            });
        }
        else
        {
            $('.cart-sidenav__loader').hide();
            invalidate_field($('#search_shipments-zip_code'), fields.zip_code.error_message);
        }
    });
    $('.cart-sidenav__content').on('click', '.change_shipment-btn', function(e){
        e.preventDefault();
        ca_carrito_enable_cp_edit = true;
        build_cart(ca_carrito, false, []);
        $('.search_shipments-grid').show();
        $('.search_shipments-icon').attr('uk-icon', 'chevron-up');
    });
    $('.cart-sidenav__content').on('click', '.shipment_option_radio', function(){
        var envio_seleccionado = parseInt($('input[name=shipment_option_radio]:checked').val());
        ca_carrito.envio.envio_seleccionado = envio_seleccionado;
        build_cart(ca_carrito, false, []);
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            url: "/v4/cart/change-shipment-option",
            dataType: "JSON",
            method: "POST",
            data: {
                shipment_option: envio_seleccionado
            }
        }).done(function(resp){}).fail(function(err){});
    });
    $('.cart-sidenav__content').on('click', '.cart-sidenav__shipment-result-item-show-more-link', function(e){
        e.preventDefault();
        var key = $(this).attr('data-key');
        var envio = ca_carrito.envio;
        var envio_seleccionado = envio.envio_seleccionado;
        var envios_format_obj = sort_shipping_cart_options(envio.envios_disponibles, envio.envio_seleccionado);
        var envios_format = envios_format_obj.options;
        $('.cart-sidenav__shipment-result-item-show-more').hide();
        var newHtml = '';
        envios_format[key].others.forEach(function(option){
            newHtml += build_single_shipping_cart_option(option, envio_seleccionado);
        });
        $('.cart-sidenav__shipment-result-list--'+key).append(newHtml);
    });
    $('.cart-sidenav__content').on('click', '#start_checkout-btn', function(){
        set_loading_button($('#start_checkout-btn'));
        $.ajax({
            headers: {
                'X-CSRF-TOKEN': csrf_token
            },
            url: "/v4/cart/start-checkout",
            dataType: "JSON",
            method: "POST"
        }).done(function(resp){
            if(facebook_pixel_tracking)
            {
                if(fbq!==undefined)
                {
                    fbq('track', 'InitiateCheckout', {
                        currency: currency.country_code, 
                        value: get_cart_parameters(ca_carrito, cupones_descuento).total_without_shipment,
                        content_ids: get_facebook_pixel_content_ids(ca_carrito.productos),
                        content_type: 'product'
                    });
                }
            }
            redirect('/checkout');
            unset_loading_button($('#start_checkout-btn'), false);
        }).fail(function(err){
            var resp = err.responseJSON;
            if(resp && resp.message)
            {
                var code = resp.message.code;
                if(code)
                {
                    var errors = resp.message.description;
                    var ca_carrito_new = resp.data;
                    build_cart(ca_carrito_new, false, errors);
                }
                else
                {
                    build_cart(ca_carrito, false, [resp.message.description]);
                }
            }
            else
            {
                build_cart(ca_carrito, false, []);
            } 
            unset_loading_button($('#start_checkout-btn'), false); 
        });
    });
    //end cart

    //login
    $('#login-modal').on({
        'show.uk.modal': function(){
            if(login_captcha===null)
            {
                login_captcha = grecaptcha.render('login-btn', {
                    'sitekey': sitekey,
                    'callback': function() {
                        $('#login-form').submit();
                    },
                    'error-callback': function(){
                        grecaptcha.reset(login_captcha);
                    }
                });
            }
            else
            {
                grecaptcha.reset(login_captcha);
            }
        }
    });
    $('#login-form').on('submit', function(e){
        e.preventDefault();
        set_loading_button($('#login-btn'));
        $('#login-alert').html('');
        if(validate_form($('#login-form')))
        {
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                url: "/v4/login",
                dataType: "JSON",
                method: "POST",
                data: new FormData($(this)[0]),
                cache: false,
                contentType: false,
                processData: false
            }).done(function(resp){
                redirect(window.location.href);
            }).fail(function(err){
                var resp = err.responseJSON;
                grecaptcha.reset(login_captcha);
                if(resp && resp.message)
                {
                    error($('#login-alert'), resp.message.description);
                }
                unset_loading_button($('#login-btn'), true);
            });
        }
        else
        {
            grecaptcha.reset(login_captcha);
            unset_loading_button($('#login-btn'), true);
        }
    });
    //end login

    //register
    $('#register-modal').on({
        'show.uk.modal': function(){
            if(register_captcha===null)
            {
                register_captcha = grecaptcha.render('register-btn', {
                    'sitekey': sitekey,
                    'callback': function() {
                        $('#register-form').submit();
                    },
                    'error-callback': function(){
                        grecaptcha.reset(register_captcha);
                    }
                });
            }
            else
            {
                grecaptcha.reset(register_captcha);
            }
        }
    });
    $('#register-form').on('submit', function(e){
        e.preventDefault();
        set_loading_button($('#register-btn'));
        $('#register-alert').html('');
        if(validate_form($('#register-form')))
        {
            if(compare_fields($('#register_password'), $('#register_repeat_password')))
            {
                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': csrf_token
                    },
                    url: "/v4/register",
                    dataType: "JSON",
                    method: "POST",
                    data: new FormData($(this)[0]),
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function(resp){
                    redirect(window.location.href);
                }).fail(function(err){
                    var resp = err.responseJSON;
                    grecaptcha.reset(register_captcha);
                    if(resp && resp.message)
                    {
                        error($('#register-alert'), resp.message.description);
                    }
                    unset_loading_button($('#register-btn'), true);
                });
            }
            else
            {
                grecaptcha.reset(register_captcha);
                unset_loading_button($('#register-btn'), true);
                invalidate_field($('#register_repeat_password'), fields.repeat_password.error_message_repeat);
            }
        }
        else
        {
            grecaptcha.reset(register_captcha);
            unset_loading_button($('#register-btn'), true);
        }
    });
    //end register

    //wholesaler
    $('#wholesaler-modal').on({
        'show.uk.modal': function(){
            if(wholesaler_captcha===null)
            {
                wholesaler_captcha = grecaptcha.render('wholesaler-btn', {
                    'sitekey': sitekey,
                    'callback': function() {
                        $('#wholesaler-form').submit();
                    },
                    'error-callback': function(){
                        grecaptcha.reset(wholesaler_captcha);
                    }
                });
            }
            else
            {
                grecaptcha.reset(wholesaler_captcha);
            }
        }
    });
    $('#wholesaler-form').on('submit', function(e){
        e.preventDefault();
        set_loading_button($('#wholesaler-btn'));
        $('#wholesaler-alert').html('');
        if(validate_form($('#wholesaler-form')))
        {
            if(compare_fields($('#wholesaler_password'), $('#wholesaler_repeat_password')))
            {
                $.ajax({
                    headers: {
                        'X-CSRF-TOKEN': csrf_token
                    },
                    url: "/v4/wholesaler",
                    dataType: "JSON",
                    method: "POST",
                    data: new FormData($(this)[0]),
                    cache: false,
                    contentType: false,
                    processData: false
                }).done(function(resp){
                    $('#wholesaler-modal-content').remove();
                    $('#wholesaler-modal-footer').remove();
                    success($('#wholesaler-alert'), resp.message.description);
                }).fail(function(err){
                    var resp = err.responseJSON;
                    grecaptcha.reset(wholesaler_captcha);
                    if(resp && resp.message)
                    {
                        error($('#wholesaler-alert'), resp.message.description);
                    }
                    unset_loading_button($('#wholesaler-btn'), true);
                });
            }
            else
            {
                grecaptcha.reset(wholesaler_captcha);
                unset_loading_button($('#wholesaler-btn'), true);
                invalidate_field($('#wholesaler_repeat_password'), fields.repeat_password.error_message_repeat);
            }
        }
        else
        {
            grecaptcha.reset(wholesaler_captcha);
            unset_loading_button($('#wholesaler-btn'), true);
        }
    });
    //end wholesaler

    //recover
    $('#recover-modal').on({
        'show.uk.modal': function(){
            if(recover_captcha===null)
            {
                recover_captcha = grecaptcha.render('recover-btn', {
                    'sitekey': sitekey,
                    'callback': function() {
                        $('#recover-form').submit();
                    },
                    'error-callback': function(){
                        grecaptcha.reset(recover_captcha);
                    }
                });
            }
            else
            {
                grecaptcha.reset(recover_captcha);
            }
        }
    });
    $('#recover-form').on('submit', function(e){
        e.preventDefault();
        set_loading_button($('#recover-btn'));
        $('#recover-alert').html('');
        if(validate_form($('#recover-form')))
        {
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                url: "/v4/recover",
                dataType: "JSON",
                method: "POST",
                data: new FormData($(this)[0]),
                cache: false,
                contentType: false,
                processData: false
            }).done(function(resp){
                $('#recover-modal-content').remove();
                $('#recover-modal-footer').remove();
                success($('#recover-alert'), resp.message.description);
            }).fail(function(err){
                var resp = err.responseJSON;
                grecaptcha.reset(recover_captcha);
                if(resp && resp.message)
                {
                    error($('#recover-alert'), resp.message.description);
                }
                unset_loading_button($('#recover-btn'), true);
            });
        }
        else
        {
            grecaptcha.reset(recover_captcha);
            unset_loading_button($('#recover-btn'), true);
        }
    });
    //end recover

    //newsletter
    $('#newsletter_email').on('focus', function(){
        if(newsletter_captcha===null)
        {
            newsletter_captcha = grecaptcha.render('newsletter-btn', {
                'sitekey': sitekey,
                'callback': function() {
                    $('#newsletter-form').submit();
                },
                'error-callback': function(){
                    grecaptcha.reset(newsletter_captcha);
                }
            });
        }
        else
        {
            grecaptcha.reset(newsletter_captcha);
        }
    });
    $('#newsletter-form').on('submit', function(e){
        e.preventDefault();
        set_loading_button($('#newsletter-btn'));
        if(validate_form($('#newsletter-form')))
        {
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                url: "/v4/newsletter",
                dataType: "JSON",
                method: "POST",
                data: new FormData($(this)[0]),
                cache: false,
                contentType: false,
                processData: false
            }).done(function(resp){
                success($('#newsletter-form'), resp.message.description);
            }).fail(function(err){
                var resp = err.responseJSON;
                grecaptcha.reset(newsletter_captcha);
                if(resp && resp.message)
                {
                    invalidate_field($('#newsletter_email'), resp.message.description);
                }
                unset_loading_button($('#newsletter-btn'), true);
            });
        }
        else
        {
            grecaptcha.reset(newsletter_captcha);
            unset_loading_button($('#newsletter-btn'), true);
        }
    });
    //end newsletter

    //contact
    $('#contact-modal').on({
        'show.uk.modal': function(){
            if(contact_captcha===null)
            {
                contact_captcha = grecaptcha.render('contact-btn', {
                    'sitekey': sitekey,
                    'callback': function() {
                        $('#contact-form').submit();
                    },
                    'error-callback': function(){
                        grecaptcha.reset(contact_captcha);
                    }
                });
            }
            else
            {
                grecaptcha.reset(contact_captcha);
            }
        },
        'hidden.uk.modal': function(){
            $('#contact_product_id').val(0);
            $('#contact_stk_id').val(0);
            $('#contact__show-product').html('');
        }
    });
    $('#contact-form').on('submit', function(e){
        e.preventDefault();
        set_loading_button($('#contact-btn'));
        $('#contact-alert').html('');
        if(validate_form($('#contact-form')))
        {
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                url: "/v4/contact",
                dataType: "JSON",
                method: "POST",
                data: new FormData($(this)[0]),
                cache: false,
                contentType: false,
                processData: false
            }).done(function(resp){
                success($('#contact-modal-content'), resp.message.description);
                $('#contact-modal-footer').remove();
                if(facebook_pixel_tracking)
                {
                    if(fbq!==undefined)
                    {
                        fbq('track', 'Contact');
                    }
                }
            }).fail(function(err){
                var resp = err.responseJSON;
                grecaptcha.reset(contact_captcha);
                if(resp && resp.message)
                {
                    error($('#contact-alert'), resp.message.description);
                }
                unset_loading_button($('#contact-btn'), true);
            });
        }
        else
        {
            grecaptcha.reset(contact_captcha);
            unset_loading_button($('#contact-btn'), true);
        }
    });
    //end contact

    //regret
    $('#regret-modal').on({
        'show.uk.modal': function(){
            if(regret_captcha===null)
            {
                regret_captcha = grecaptcha.render('regret-btn', {
                    'sitekey': sitekey,
                    'callback': function() {
                        $('#regret-form').submit();
                    },
                    'error-callback': function(){
                        grecaptcha.reset(regret_captcha);
                    }
                });
            }
            else
            {
                grecaptcha.reset(regret_captcha);
            }
        }
    });
    $('#regret-form').on('submit', function(e){
        e.preventDefault();
        set_loading_button($('#regret-btn'));
        $('#regret-alert').html('');
        if(validate_form($('#regret-form')))
        {
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': csrf_token
                },
                url: "/v4/regret",
                dataType: "JSON",
                method: "POST",
                data: new FormData($(this)[0]),
                cache: false,
                contentType: false,
                processData: false
            }).done(function(resp){
                success($('#regret-modal-content'), resp.message.description);
                $('#regret-modal-footer').remove();
            }).fail(function(err){
                var resp = err.responseJSON;
                grecaptcha.reset(regret_captcha);
                if(resp && resp.message)
                {
                    error($('#regret-alert'), resp.message.description);
                }
                unset_loading_button($('#regret-btn'), true);
            });
        }
        else
        {
            grecaptcha.reset(regret_captcha);
            unset_loading_button($('#regret-btn'), true);
        }
    });
    //end regret

    //search bar
    searchPush();
    $('.header-search__input').devbridgeAutocomplete({
        serviceUrl: "/v4/search-product",
        type: "GET",
        deferRequestBy: 300,
        triggerSelectOnValidInput: false,
        formatResult: function(suggestion) {
            var producto = suggestion.data;
            var searchHtml = '<div class="autocomplete-suggestion__wrapper">';
            searchHtml += '<div class="autocomplete-suggestion__image-box">';
            searchHtml += '<img src="'+cdn+producto.imagenes[0].i_link+'" class="autocomplete-suggestion__image" alt="producto"/>';
            searchHtml += '</div>';
            searchHtml += '<div class="autocomplete-suggestion__product-container">';
            searchHtml += '<p class="autocomplete-suggestion__product-name">'+producto.p_nombre+'</p>';
            if(estado_mayorista)
            {
                searchHtml += '<p class="autocomplete-suggestion__product-price">'+number_format(producto.p_precio_mayorista)+' - Min. '+producto.p_cantidad_minima+'</p>';
            }
            else
            {
                if(producto.p_mostrar_precio)
                {
                    if(producto.p_oferta)
                    {
                        switch(producto.p_oferta)
                        {
                            case 1:
                                searchHtml += '<p class="autocomplete-suggestion__product-price"><del>'+number_format(producto.p_precio)+'</del> '+number_format(producto.p_precio_oferta)+'</p>';
                            break;
                            case 2:
                                if(compare_dates('now', producto.p_oferta_fecha))
                                {
                                    searchHtml += '<p class="autocomplete-suggestion__product-price"><del>'+number_format(producto.p_precio)+'</del> '+number_format(producto.p_precio_oferta)+'</p>';
                                }
                                else
                                {
                                    searchHtml += '<p class="autocomplete-suggestion__product-price">'+number_format(producto.p_precio)+'</p>';
                                }
                            break;
                            case 3:
                                if(compare_dates_between('now', producto.p_oferta_fecha_inicio, producto.p_oferta_fecha))
                                {
                                    searchHtml += '<p class="autocomplete-suggestion__product-price"><del>'+number_format(producto.p_precio)+'</del> '+number_format(producto.p_precio_oferta)+'</p>';
                                }
                                else
                                {
                                    searchHtml += '<p class="autocomplete-suggestion__product-price">'+number_format(producto.p_precio)+'</p>';
                                }
                            break;
                        }
                    }
                    else
                    {
                        searchHtml += '<p class="autocomplete-suggestion__product-price">'+number_format(producto.p_precio)+'</p>';
                    }
                }
            }
            searchHtml += '</div>';
            searchHtml += '</div>';
            return searchHtml;
        },
        onSelect: function(suggestion) {
            var producto = suggestion.data;
            var c_link_full = get_category_link(producto.Categorias_idCategorias, categorias_flatten);
            var link_producto = uri+c_link_full+'/'+producto.p_link;
            redirect(link_producto);
        },
        beforeRender: function(container, suggestions) {
            if(facebook_pixel_tracking)
            {
                if(fbq!==undefined)
                {
                    var search_string = $('.header-search__input').val();
                    var content_ids = suggestions.map(function(item){
                        return item.data.idProductos.toString();
                    });

                    fbq('track', 'Search', {
                        search_string: search_string,
                        content_ids: content_ids
                    });
                }
            }
        },
        showNoSuggestionNotice: true,
        noSuggestionNotice: '<p class="autocomplete-suggestion__no-results">'+search_autocomplete_not_found+'</p>'
    });  
    $('.search-bar-open').on('click', function(e) {
        e.preventDefault();
        $('.header-search').addClass('header-search--visible');
        $('.header-search__input').focus();
    });
    $('.search-bar-close').on('click', function(e) {
        e.preventDefault();
        $('.header-search').removeClass('header-search--visible');
    });
    $('.header-search__input').on('keyup', function(e) {
        if(e.keyCode===27)
        {
            $('.header-search').removeClass('header-search--visible');
        }
    });  
    //end search bar

    //chat bubble
    $('.chat__bubble--dispatcher').on('click', function(e) {
        $('.chat-bubbles__list').toggleClass('chat-bubbles__list--active');
        $('.chat-bubbles__list-item').toggleClass('chat-bubbles__list-item--active');
    });
    //end chat bubble
    
});