function update_gun_vs_for_various_distance_chart(gun1, gun2, options, cache){
    var series=[{
        name: gun1.display_name + ' (A) wins',
        color: '#54aef7',
        data: []
    }, {
        name: 'Draw',
        color: '#c8c8c8',
        data: []
    }, {
        name: 'Timeout',
        color: '#a0a0a0',
        data: []
    }, {
        name: gun2.display_name + ' (B) wins',
        color: '#f79e54',
        data: []
    }];

	var default_headshot_ratio = options.default_headshot_percent / 100.0 ;
	var default_hit_ratio = options.default_hit_percent / 100.0 ;
    var gun_info1 = new GunInfo(gun1, default_headshot_ratio, default_hit_ratio);
    var gun_info2 = new GunInfo(gun2, default_headshot_ratio, default_hit_ratio);
    var max_time_ms = 3000;
    var result = null;
    var win1 = 0;
    var win2 = 0;
    for (var distance = 0; distance <= 100; distance ++){
        result = gun_vs(options.total_hp, gun_info1, gun_info2, distance, max_time_ms, cache);
        result = reduce_result(options.total_hp, result);

        win1 = result.win1_hp["100"] + result.win1_hp["150"] + result.win1_hp["200"] + result.win1_hp["250"];
        win2 = result.win2_hp["100"] + result.win2_hp["150"] + result.win2_hp["200"] + result.win2_hp["250"];

        series[0].data.push([distance,win1]);
        series[1].data.push([distance,result.draw]);
        series[2].data.push([distance,result.timeout]);
        series[3].data.push([distance,win2]);
    }

    var title_text = gun1.display_name + ' (A) VS ' + gun2.display_name + ' (B)';
    var subtitle_text='';

    Highcharts.chart('gun_vs_for_various_distance', {
        chart: {
            type: 'area'
        },
        title: {
            text: title_text
        },
        subtitle: {
            text: subtitle_text
        },
        xAxis: {
            title: {
                text: "distance (m)"
            }
        },
        yAxis: {
            labels: {
                format: '{value}%'
            },
            title: {
                text: "Win %"
            }
        },
        tooltip: {
            pointFormat: '<span style="color:{series.color}">{series.name}</span>: <b>{point.percentage:.1f}%</b><br>',
            shared: true,
        },
        plotOptions: {
            series: {
                animation: false,
                marker: {
                    enabled: false
                }
            },
            area: {
                stacking: 'percent',
                lineColor: '#ffffff',
                lineWidth: 1,
                marker: {
                    lineWidth: 1,
                    lineColor: '#ffffff'
                },
            }
        },
        series: series
    });
}

function update_gun_vs_average_on_distance_chart(gun1, gun2, options, cache){
    var colors = {
        win1: ['#b7daf7','#86c4f7','#54aef7','#2398f7',],
        win2: ['#f7d4b7','#f7b986','#f79e54','#f78223',],
        draw: '#c8c8c8',
        timeout: '#a0a0a0',
    }

    var result_data = [];
    var result_data_details = [];

    var sum_result={
        win1: 0,
        win2: 0,
        draw: 0
    };

    var sum_result_details={
        win1_hp: {
            100: 0,
            150: 0,
            200: 0,
            250: 0,
        },
        win2_hp: {
            100: 0,
            150: 0,
            200: 0,
            250: 0,
        },
        draw: 0,
        timeout: 0
    };

	var default_headshot_ratio = options.default_headshot_percent / 100.0 ;
	var default_hit_ratio = options.default_hit_percent / 100.0 ;
    var gun_info1 = new GunInfo(gun1, default_headshot_ratio, default_hit_ratio);
    var gun_info2 = new GunInfo(gun2, default_headshot_ratio, default_hit_ratio);
    var max_time_ms = 3000;
    var result = null;
    for (var distance = options.min_distance; distance <= options.max_distance; distance ++){
        result = gun_vs(options.total_hp, gun_info1, gun_info2, distance, max_time_ms, cache);
        result = reduce_result(options.total_hp, result);

        sum_result.win1 += result.win1_hp["100"] + result.win1_hp["150"] + result.win1_hp["200"] + result.win1_hp["250"];
        sum_result.win2 += result.win2_hp["100"] + result.win2_hp["150"] + result.win2_hp["200"] + result.win2_hp["250"];
        sum_result.draw += result.draw + result.timeout;

        sum_result_details.win1_hp["100"] += result.win1_hp["100"];
        sum_result_details.win1_hp["150"] += result.win1_hp["150"];
        sum_result_details.win1_hp["200"] += result.win1_hp["200"];
        sum_result_details.win1_hp["250"] += result.win1_hp["250"];
        sum_result_details.draw += result.draw;
        sum_result_details.timeout += result.timeout;
        sum_result_details.win2_hp["100"] += result.win2_hp["100"];
        sum_result_details.win2_hp["150"] += result.win2_hp["150"];
        sum_result_details.win2_hp["200"] += result.win2_hp["200"];
        sum_result_details.win2_hp["250"] += result.win2_hp["250"];

    }

    var result_data = [{
        name: gun1.display_name + ' (A) wins',
        y: sum_result.win1,
        color: colors.win1[3]
    },{
        name: 'Draw',
        y: sum_result.draw,
        color: colors.draw
    },{
        name: gun2.display_name + ' (B) wins',
        y: sum_result.win2,
        color: colors.win2[3]
    }];

    var result_details_data = [{
        name: '(A) 200+ HP',
        y: sum_result_details.win1_hp["250"],
        color: colors.win1[3],
    }, {
        name: '(A) 150+ HP',
        y: sum_result_details.win1_hp["200"],
        color: colors.win1[2],
    }, {
        name: '(A) 100+ HP',
        y: sum_result_details.win1_hp["150"],
        color: colors.win1[1],
    }, {
        name: '(A) 1-100 HP',
        y: sum_result_details.win1_hp["100"],
        color: colors.win1[0],
    }, {
        name: 'Draw',
        y: sum_result_details.draw,
        color: colors.draw,
    }, {
        name: 'Timeout',
        y: sum_result_details.timeout,
        color: colors.timeout,
    }, {
        name: '(B) 1-100 HP',
        y: sum_result_details.win2_hp["100"],
        color: colors.win2[0],
    }, {
        name: '(B) 100+ HP',
        y: sum_result_details.win2_hp["150"],
        color: colors.win2[1],
    }, {
        name: '(B) 150+ HP',
        y: sum_result_details.win2_hp["200"],
        color: colors.win2[2],
    }, {
        name: '(B) 200+ HP',
        y: sum_result_details.win2_hp["250"],
        color: colors.win2[3],
    }];


    var title_text = gun1.display_name + ' (A) VS ' + gun2.display_name + ' (B) by winning HP';
    var subtitle_text=`Averaged on ${options.min_distance}-${options.max_distance} m`;


    Highcharts.chart('gun_vs_average_on_distance', {
        chart: {
            type: 'pie'
        },
        title: {
            text: title_text
        },
        subtitle: {
            text: subtitle_text
        },
        plotOptions: {
            pie: {
                shadow: false,
                center: ['50%', '50%']
            }
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>',
        },
        series: [{
            name: 'Result',
            data: result_data,
            size: '60%',
            dataLabels: {
                formatter: function () {
                    return this.y > 5 ? this.point.name : null;
                },
                color: '#ffffff',
                distance: -30
            }
        }, {
            name: 'HP left',
            data: result_details_data,
            size: '80%',
            innerSize: '60%',
            dataLabels: {
                formatter: function () {
                    return this.point.percentage >= 0.1 ? this.point.name+': '+this.point.percentage.toFixed(1) + '%' : null;
                },
            }
        }],
        plotOptions: {
            series: {
                animation: false,
                marker: {
                    enabled: false
                }
            }
        },
    });
}


function update_gun_vs_charts(guns, options){
    var guns = get_current_guns();
    var options = get_options();
    var gun1 = null;
    var gun2 = null;

    for (var i = 0; i < guns.length; i++){
        if (guns[i].is_gun_for_vs_a){
            gun1 = guns[i];
        }
        if (guns[i].is_gun_for_vs_b){
            gun2 = guns[i];
        }
    }

    if (!gun1 || !gun2){
        return;
    }

    var cache = {};
    update_gun_vs_for_various_distance_chart(gun1, gun2, options, cache);
    update_gun_vs_average_on_distance_chart(gun1, gun2, options, cache);
}

