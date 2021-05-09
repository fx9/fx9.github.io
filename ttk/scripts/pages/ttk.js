Highcharts.setOptions({
    lang: {
        thousandsSep: ""
    }
});
// options operations
function get_options(){
    var options = {};
    for (var key in DEFAULT_OPTIONS){
        options[key] = Number($('#'+key).val());
    }
    return options;
}

function set_options(options){
    for (var key in options){
        $('#'+key).val(options[key]);
    }
}

$('#options').find('input').change(function(){
    update_page();
});

// gun selection and list operations
function create_gun_selection(){
    var select_gun = $('#select_gun');
    for (var i = 0; i < DEFAULT_GUNS.length; i++) {
        var el = document.createElement('option');
        el.text = DEFAULT_GUNS[i].name;
        el.value = JSON.stringify(DEFAULT_GUNS[i]);
        select_gun.append(el);
    }
}

function add_gun_obj(gun_obj){
    var gun_div=create_gun_div(gun_obj);
    gun_div.find('.remove_gun').click(function(){
        $(this).closest('.gun').remove();
    });
    $('#guns').append(gun_div);
}

$('#add_gun').click(function(){
    var selected=$('#select_gun option:selected');
    if(selected.length == 0){
        return;
    }
    var gun_json=selected.eq(0).val();
    var gun = JSON.parse(gun_json);
    add_gun_obj(gun);
    update_page();
});

function get_current_guns(){
    var guns=[];
    $('.gun').each(function(){
        guns.push(get_gun_obj($(this)));
    });
    return guns;
}

// page operations
function compose_save_data(){
    return {
        version: '0.1',
        guns: get_current_guns().map(persistent_gun),
        options: get_options()
    };
}

function get_save_data_str(){
    var save_data = compose_save_data();
    return LZString.compressToEncodedURIComponent(JSON.stringify(save_data));
}

function update_page(alert_msg=''){
    var save_data_str = get_save_data_str();
    var newurl = window.location.origin + window.location.pathname + '?save_data=' + save_data_str;
    window.history.replaceState({ path: newurl }, '', newurl);

    var custom_gun_url = 'custom_gun.html?save_data=' + save_data_str;
    $('#custom_gun_link').attr('href', custom_gun_url);

    if (alert_msg) {
        alert('refreshed '+msg);
    }
    setTimeout(update_chart, 0);
}

function update_chart(){
    var guns = get_current_guns();
    var options = get_options();
    update_ttk_for_various_distance(guns, options);
    update_ttk_for_various_headshot_percent(guns, options);
    update_gun_vs_charts(guns, options);
}

function init(){
    // initialize page elements
    $('#data_updated').text(new Date(UPDATE_EPOCH*1000).toISOString().split('T')[0])

    create_gun_selection();
    $('#select_gun').change();

    // load and apply save data
    load_saved_data();
    set_options(SAVE_DATA.options);
    for(var i=0;i<SAVE_DATA.guns.length;i++){
        add_gun_obj(recover_gun(SAVE_DATA.guns[i]));
    }

    update_page();
}
init();

// util functions
function copy_text(selector){
  var $input = $(selector);
  var el = $input.get(0);
  var editable = el.contentEditable;
  var readOnly = el.readOnly;
  el.contentEditable = true;
  el.readOnly = false;
  var range = document.createRange();
  range.selectNodeContents(el);
  var sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
  el.setSelectionRange(0, 999999);
  el.contentEditable = editable;
  el.readOnly = readOnly;
  document.execCommand('copy');
  $input.select();
  document.execCommand('copy');
  $input.blur();
}