function ttk_info_vs(ttk_info1, ttk_info2, max_time_ms){
    var result = {
        win1: {},
        win2: {},
        draw: 0.0,
        timeout: 0.0
    };

    var max_shots1 = Math.floor(((max_time_ms - ttk_info1.extra_time_ms) / ttk_info1.interval_ms) + 1);
    var one_shot_dd1 = one_shot_damage_distribution(ttk_info1.damage, ttk_info1.parts_ratios, ttk_info1.hit_ratio);
    var ddbs1 = damage_distribution_by_shots(ttk_info1.total_hp, one_shot_dd1, max_shots1);

    var max_shots2 = Math.floor(((max_time_ms - ttk_info2.extra_time_ms) / ttk_info2.interval_ms) + 1);
    var one_shot_dd2 = one_shot_damage_distribution(ttk_info2.damage, ttk_info2.parts_ratios, ttk_info2.hit_ratio);
    var ddbs2 = damage_distribution_by_shots(ttk_info2.total_hp, one_shot_dd2, max_shots2);

    var shots1 = 1;
    var shots2 = 1;
    var time1 = 0;
    var time2 = 0;


    var dd1 = null;
    var dd2 = null;
    var prev_kc1 = null; // kc = kill chance
    var prev_kc2 = null;
    var curr_kc1 = null;
    var curr_kc2 = null;
    var this_shot_kc1 = null;
    var this_shot_kc2 = null;
    var draw = null;
    var win1 = null;
    var win2 = null
    var shots1_inc=null;
    var shots2_inc=null;
    var kc_sum = 0;
    while (shots1 <= max_shots1 || shots2 <= max_shots2){
        time1 = (shots1 - 1) * ttk_info1.interval_ms + ttk_info1.extra_time_ms;
        time2 = (shots2 - 1) * ttk_info2.interval_ms + ttk_info2.extra_time_ms;
        this_shot_kc1 = 0;
        this_shot_kc2 = 0;
        shots1_inc = 0;
        shots2_inc = 0;
        prev_kc1 = d_get(ddbs1[shots1 - 1], ttk_info1.total_hp);
        prev_kc2 = d_get(ddbs2[shots2 - 1], ttk_info2.total_hp);

        if (time1 <= time2){
            curr_kc1 = d_get(ddbs1[shots1], ttk_info1.total_hp);
            if (curr_kc1 > prev_kc1) {
                this_shot_kc1 = curr_kc1 - prev_kc1;
            }
            shots1_inc = 1;
        } else {
            curr_kc1 = prev_kc1; // this shot is not fired
        }

        if (time1 >= time2){
            curr_kc2 = d_get(ddbs2[shots2], ttk_info2.total_hp);
            if (curr_kc2 > prev_kc2) {
                this_shot_kc2 = curr_kc2 - prev_kc2;
            }
            shots2_inc = 1;
        } else {
            curr_kc2 = prev_kc2; // this shot is not fired
        }

        draw = this_shot_kc1 * this_shot_kc2;
        win1 = this_shot_kc1 * (1 - curr_kc2);
        win2 = this_shot_kc2 * (1 - curr_kc1);

        if (draw > 0){
            result.draw += draw;
        }
        if (win1 > 0){
            dd2 = d_multiply(ddbs2[shots2 - 1], win1 / (1 - prev_kc2));
            delete dd2[ttk_info2.total_hp];
            result.win1 = d_merge(result.win1, dd2);
        }
        if (win2 > 0){
            dd1 = d_multiply(ddbs1[shots1 - 1], win2 / (1 - prev_kc1));
            delete dd1[ttk_info1.total_hp];
            result.win2 = d_merge(result.win2, dd1);
        }

        kc_sum += (draw + win1 + win2);
        shots1 += shots1_inc;
        shots2 += shots2_inc;
    }
    result.timeout = 1 - kc_sum;
    return result;
}

function gun_vs(total_hp, gun_info1, gun_info2, distance, max_time_ms){
    var ttk_info1 = gun_info1.get_ttk_info(total_hp, distance);
    var ttk_info2 = gun_info2.get_ttk_info(total_hp, distance);
    return ttk_info_vs(ttk_info1, ttk_info2, max_time_ms);
}

function reduce_result(total_hp, gun_vs_result, hp_stages=[0, 100, 150, 200, 250]){
    var result = {
        win1_hp: {},
        win2_hp: {},
        draw: gun_vs_result.draw,
        timeout: gun_vs_result.timeout
    };

    for (var i = 1; i < hp_stages.length; i++){
        result.win1_hp[hp_stages[i]]=0;
        result.win2_hp[hp_stages[i]]=0;
    }

    var damage = 0;
    for (var key in gun_vs_result.win1){
        damage = Number(key);
        for (var i = 1; i < hp_stages.length; i++){
            if (total_hp - damage <= hp_stages[i]){
                result.win1_hp[hp_stages[i]] += gun_vs_result.win1[key];
                break
            }
        }
    }
    for (var key in gun_vs_result.win2){
        damage = Number(key);
        for (var i = 1; i < hp_stages.length; i++){
            if (total_hp - damage <= hp_stages[i]){
                result.win2_hp[hp_stages[i]] += gun_vs_result.win1[key];
                break
            }
        }
    }
    return result
}


function normalize_result(reduced_result, granularity=0.0001){
    function normalize(x){
        return Math.round(x / granularity) * granularity;
    }
    var result = {
        win1_hp: {},
        win2_hp: {},
        draw: normalize(reduced_result.draw),
        timeout: normalize(reduced_result.timeout)
    };

    var sum = result.draw + result.timeout;

    for (var key in reduced_result.win1_hp){
        result.win1_hp[key] = normalize(reduced_result.win1_hp[key]);
        sum += result.win1_hp[key];
    }
    for (var key in reduced_result.win2_hp){
        result.win2_hp[key] = normalize(reduced_result.win2_hp[key]);
        sum += result.win2_hp[key];
    }

    result.draw += 1 - sum;

    return result
}
