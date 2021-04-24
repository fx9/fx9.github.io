function stkd_multiply(stkd, ratio){
    var ret = {};
    for (var key in stkd){
        ret[key] = stkd[key] * ratio;
    }
    return ret;
}

function stkd_add_shots(stkd, shots){
    var ret = {};
    var newkey = 0;
    for (var key in stkd){
        newkey = Math.max(Number(key) + shots, 0);
        ret[newkey] = stkd[key];
    }
    return ret;
}

function stkd_merge(stkd1, stkd2){
    var ret = {};
    for (var key in stkd1){
        ret[key] = stkd1[key];
    }
    for (var key in stkd2){
        if (key in ret){
            ret[key] += stkd2[key];
        } else {
            ret[key] = stkd2[key];
        }
    }
    return ret;
}

function stkd_strip(stkd, max_shots){
    var ret = {};
    var newkey = 0;
    for (var key in stkd){
        newkey = Math.min(key, max_shots);
        if (newkey in ret){
            ret[newkey] += stkd[key];
        } else {
            ret[newkey] = stkd[key];
        }
    }
    return ret;
}

function stk_distribution(total_hp, damage, parts_ratios){
    var zero_stkd = {0:1.0};
    var stkd_table = [zero_stkd];

    function get_stkd(hp){
        if (hp < 0){
            return zero_stkd;
        }
        return stkd_table[hp];
    }

    var stkd = null;
    var temp_stkd = null;
    for (var hp = 1; hp <= total_hp; hp++){
        stkd = {};
        for (var i =0; i < parts_ratios.length; i++){
            temp_stkd = get_stkd(hp - damage[i]);
            temp_stkd = stkd_multiply(temp_stkd, parts_ratios[i]);
            temp_stkd = stkd_add_shots(temp_stkd, 1);
            stkd = stkd_merge(stkd, temp_stkd);
        }
        stkd_table.push(stkd);
    }
    return stkd_table[stkd_table.length-1];
}

function stkd_apply_hit_ratio(stkd, hit_ratio, max_shots){
    var hit_stkd = null;
    var miss_stkd = null;
    var final_stkd = {};
    var sum_stkd = stkd_multiply(stkd, 1);

    if (sum_stkd[0]){
        final_stkd[0] = sum_stkd[0];
        delete sum_stkd[0];
    }

    for (var i=1; i <= max_shots; i++){
        hit_stkd = stkd_multiply(sum_stkd, hit_ratio);
        hit_stkd = stkd_add_shots(hit_stkd, -1);
        miss_stkd = stkd_multiply(sum_stkd, 1 - hit_ratio);
        sum_stkd = stkd_merge(hit_stkd, miss_stkd);
        if (sum_stkd[0]){
            final_stkd[i] = sum_stkd[0];
            delete sum_stkd[0];
        }
    }

    var last_key = max_shots + 1;
    for (var key in sum_stkd){
        if (last_key in final_stkd){
            final_stkd[last_key] += sum_stkd[key];
        } else {
            final_stkd[last_key] = sum_stkd[key];
        }
    }

    return final_stkd;

}

function stkd_to_ttkd(stkd, interval_ms, extra_time_ms){
    var ttkd = {};
    var newkey = 0;
    for (var key in stkd){
        newkey = Number(key);
        newkey = (newkey > 0) ? newkey - 1 : 0;
        newkey *= interval_ms;
        newkey += extra_time_ms;
        if (newkey in ttkd){
            ttkd[newkey] += stkd[key];
        } else {
            ttkd[newkey] = stkd[key];
        }
    }
	return ttkd;
}

function ttk_distribution_ms(total_hp, damage, parts_ratios, rpm, hit_ratio, extra_time_ms, max_time_ms){
    var stkd = stk_distribution(total_hp, damage, parts_ratios);
    var interval_ms = 60.0 * 1000 / rpm;
    var max_shots = Math.floor(((max_time_ms - extra_time_ms) / interval_ms) + 1);
    var stkd_with_hit_ratio = stkd_apply_hit_ratio(stkd, hit_ratio, max_shots);
    var ttkd = stkd_to_ttkd(stkd_with_hit_ratio, interval_ms, extra_time_ms);
    return ttkd;
}

function ttkd_vs(ttkd1, ttkd2, draw_allowance_ms, max_time_ms){
    var result = {
        win1: 0.0,
        win2: 0.0,
        draw: 0.0,
        timeout: 0.0
    };
    var p = 0;
    var diff = 0;
    var time1 = 0;
    var time2 = 0;
    for (var key1 in ttkd1){
        time1 = Number(key1);
        for (var key2 in ttkd2){
            time2 = Number(key2);
            p = ttkd1[key1] * ttkd2[key2];
            if (time1 >= max_time_ms){
                if (time2 >= max_time_ms){
                    result.timeout += p;
                } else {
                    result.win2 += p;
                }
            } else if (time2 >= max_time_ms){
                result.win1 += p;
            } else {
                diff = time1 - time2;
                if (diff > draw_allowance_ms) {
                    result.win2 += p;
                } else if (diff < -draw_allowance_ms) {
                    result.win1 += p;
                } else {
                    result.draw += p;
                }
            }
        }
    }
    return result;
}


function gun_damage(gun, atts, distance){
    var range_multiplier = get_range_multiplier(gun, atts);
    var effective_distance = distance / range_multiplier;
    var damage_profile = find_damage_profile(gun, atts);
    return get_damage(damage_profile, effective_distance);
}

function gun_vs(total_hp, gun1, atts1, parts_ratios1, hit_ratio1, gun2, atts2, parts_ratios2, hit_ratio2, distance, draw_allowance_ms, max_time_ms){

    var damage1 = gun_damage(gun1, atts1, distance);
    var rpm1 = gun1.rpm * get_rpm_multiplier(gun1, atts1);
    var extra_time_ms1 = gun1.open_bolt_delay_ms + get_gun_option(gun1, 'ttk_adjustment_ms');
    var ttkd1 = ttk_distribution_ms(total_hp, damage1, parts_ratios1, rpm1, hit_ratio1, extra_time_ms1, max_time_ms);

    var damage2 = gun_damage(gun2, atts2, distance);
    var rpm2 = gun2.rpm * get_rpm_multiplier(gun2, atts2);
    var extra_time_ms2 = gun1.open_bolt_delay_ms + get_gun_option(gun2, 'ttk_adjustment_ms');
    var ttkd2 = ttk_distribution_ms(total_hp, damage2, parts_ratios2, rpm2, hit_ratio2, extra_time_ms2, max_time_ms);

    return ttkd_vs(ttkd1, ttkd2, draw_allowance_ms, max_time_ms);
}

function test(){
    var result = gun_vs(250, DEFAULT_GUNS[DEFAULT_GUNS_INDEX['M4A1']], [], headshot_to_parts(0.2), 0.4, DEFAULT_GUNS[DEFAULT_GUNS_INDEX['M4A1']], [], headshot_to_parts(0.2), 0.4, 10, 16, 3000);
    console.log(result);
}