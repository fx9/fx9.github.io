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

//x=make_series_for_various_distance(250,[guns[0], guns[1]], [10,20,30,40,50,60,70,80,90], 0.2);