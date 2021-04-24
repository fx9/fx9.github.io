function stk(total_hp, damage, parts_ratios){
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

function ttk_ms(total_hp, damage, parts_ratios, rpm, hit_ratio, open_bolt_delay_ms, ttk_adjustment_ms){
	var round_per_ms = rpm / 60.0 / 1000;
	var stk_with_accuracy = stk(total_hp, damage, parts_ratios) / hit_ratio;
	var firing_time_ms = (stk_with_accuracy - 1) / round_per_ms;
    return Math.round(firing_time_ms + open_bolt_delay_ms + ttk_adjustment_ms);
}