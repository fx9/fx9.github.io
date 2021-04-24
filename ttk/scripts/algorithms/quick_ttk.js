function dp_quick_stk(total_hp, damage, parts_ratios){
    stk_table = [0.0];

    function get_stk(hp){
        if (hp < 0){
            return 0.0;
        }
        return stk_table[hp];
    }

    var stk=0;
    for (var hp =1;hp<=total_hp;hp++){
        stk = 1.0;
        for (var i =0;i<parts_ratios.length;i++){
            stk+=parts_ratios[i] * get_stk(hp - damage[i]);
        }
        stk_table.push(stk);
    }
    return stk_table[stk_table.length-1];
}

function ttk_ms(ttk_info){
	var stk_with_accuracy = dp_quick_stk(ttk_info.total_hp, ttk_info.damage, ttk_info.parts_ratios) / ttk_info.hit_ratio;
	var firing_time_ms = (stk_with_accuracy - 1) * ttk_info.interval_ms;
    return Math.round(firing_time_ms + ttk_info.extra_time_ms);
}