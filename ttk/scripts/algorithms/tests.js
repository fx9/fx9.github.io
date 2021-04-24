function test(){
    var gun1 = DEFAULT_GUNS[DEFAULT_GUNS_INDEX['M4A1']];
    var gun2 = DEFAULT_GUNS[DEFAULT_GUNS_INDEX['M4A1']];
    var default_headshot_ratio = 0.2;
    var default_hit_ratio = 0.4;
    var distance = 10;
    var max_time_ms = 3000;
    var total_hp = 250;
    var gun_info1 = new GunInfo(gun1, default_headshot_ratio, default_hit_ratio);
    var gun_info2 = new GunInfo(gun2, default_headshot_ratio, default_hit_ratio);
    var result = gun_vs(total_hp, gun_info1, gun_info2, distance, max_time_ms);
    result = reduce_result(total_hp, result);
    result = normalize_result(result);
    console.log(result);
    return result;
}