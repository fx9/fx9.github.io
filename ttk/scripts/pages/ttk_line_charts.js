function make_series_for_various_distance(total_hp, guns, distance_array, default_headshot_percent, default_hit_percent){
    var series = [];
	var default_headshot_ratio = default_headshot_percent / 100.0 ;
	var default_hit_ratio = default_hit_percent / 100.0 ;
    for (var i=0;i < guns.length;i++){
        var gun = guns[i];
        var gun_info = new GunInfo(gun, default_headshot_ratio, default_hit_ratio);
        var line={name: gun_info.distance_ttk_name,data:[]};
        for (var j=0;j < distance_array.length;j++){
            var ttk_info = gun_info.get_ttk_info(total_hp, distance_array[j]);
            var ttk = ttk_ms(ttk_info);
            line.data.push([distance_array[j], Math.round(ttk)]);
        }
        series.push(line);
    }
    return series;
}

function make_series_for_various_headshot_percent(total_hp, guns, distance_array, headshot_percent_array, default_hit_percent){
    var series = [];
	var default_headshot_ratio = 0.2;
	var default_hit_ratio = default_hit_percent / 100.0 ;
    for (var i=0;i < guns.length;i++){
        var gun = guns[i];
        var gun_info = new GunInfo(gun, default_headshot_ratio, default_hit_ratio);
        var line={name: gun_info.headshot_ttk_name,data:[]};
        for (var j=0;j < headshot_percent_array.length;j++){
            var ttk_sum = 0;
			var parts_ratios = headshot_to_parts(headshot_percent_array[j] / 100.0);
            for (var k=0;k < distance_array.length;k++){
                var ttk_info = gun_info.get_ttk_info(total_hp, distance_array[k], parts_ratios);
                ttk_sum += ttk_ms(ttk_info);
            }
            var ttk = ttk_sum / distance_array.length;
            line.data.push([headshot_percent_array[j], Math.round(ttk)]);
        }
        series.push(line);
    }
    return series;
}

function ttk_chart_highcharts_obj(title_text, subtitle_text, x_axis_text, series_array){
    return {
        plotOptions: {
            series: {
                animation: false,
                marker: {
                    enabled: false,
                },
            }
        },
        title: {
            text: title_text
        },
        subtitle: {
            text: subtitle_text
        },
        tooltip: {
            shared: true,
        },
        yAxis: {
            title: {
                text: 'ms'
            }
        },
        xAxis: {
            title: {
                text: x_axis_text
            },
            crosshair: true
        },
        legend: {
            layout: 'horizontal',
            align: 'center',
            verticalAlign: 'top',
        },
        series: series_array,
    };
}

function get_array(min_val, max_val, step){
    var array=[];
    for (var val = Math.floor(min_val/step); val <= Math.ceil(max_val/step); val+=step){
        array.push(val);
    }
    return array;
}

function update_ttk_for_various_distance(guns, options){
    var series_array = make_series_for_various_distance(options.total_hp, guns, get_array(0, 100, 1), options.default_headshot_percent, options.default_hit_percent);
    var chart_options = [options.default_headshot_percent + '% headshot'];

    if (options.default_hit_percent != 100) {
        chart_options.push(options.default_hit_percent + '% hit');
    }

    var chart_options_in_title = chart_options.join('; ');
    var title_text = 'TTK (' + chart_options_in_title+ ') by distance';
    var subtitle_text = 'Average TTK per hit% and parts hit ratio';
    var chart_obj = ttk_chart_highcharts_obj(title_text, subtitle_text, 'distance (m)', series_array)
    Highcharts.chart('ttk_for_various_distance', chart_obj);
}


function update_ttk_for_various_headshot_percent(guns, options){
    var d_array = get_array(options.min_distance, options.max_distance, 1);
    var hs_p_array = get_array(options.min_headshot_percent, options.max_headshot_percent, 1);
    var series_array = make_series_for_various_headshot_percent(options.total_hp, guns, d_array, hs_p_array, options.default_hit_percent);
    var title_text = ''+d_array[0]+'-'+d_array[d_array.length-1]+'m average TTK by headshot ('+hs_p_array[0]+'% - '+hs_p_array[hs_p_array.length-1]+'%)';
    var subtitle_text = 'Average TTK per hit% and parts hit ratio, and averaged on distance';
    var chart_obj = ttk_chart_highcharts_obj(title_text, subtitle_text, 'headshot percent', series_array)
    Highcharts.chart('ttk_for_various_headshot_percent', chart_obj);
}