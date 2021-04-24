function stk_distribution(total_hp, ddbs){
    var stkd = {};
    var curr_kill_chance = 0;
    var prev_kill_chance = d_get(ddbs[0], total_hp);
    for(var i = 1; i < ddbs.length; i++){
        curr_kill_chance = d_get(ddbs[i], total_hp);
        if (curr_kill_chance > prev_kill_chance) {
            stkd[i] = curr_kill_chance - prev_kill_chance;
        }
        prev_kill_chance = curr_kill_chance;
    }
    return stkd;
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

function ttk_distribution_ms(ttk_info, max_time_ms){
    var max_shots = Math.floor(((max_time_ms - ttk_info.extra_time_ms) / ttk_info.interval_ms) + 1);
    var one_shot_dd = one_shot_damage_distribution(ttk_info.damage, ttk_info.parts_ratios, ttk_info.hit_ratio);
    var ddbs = damage_distribution_by_shots(ttk_info.total_hp, one_shot_dd, max_shots);
    var stkd = stk_distribution(ttk_info.total_hp, ddbs);
    var ttkd = stkd_to_ttkd(stkd, ttk_info.interval_ms, ttk_info.extra_time_ms);
    return ttkd;
}
