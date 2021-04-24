function d_multiply(dstb, p){
    var ret = {};
    for (var key in dstb){
        ret[key] = dstb[key] * p;
    }
    return ret;
}

function d_custom_rekey(dstb, rekey_func){
    var ret = {};
    var newkey = 0;
    for (var key in dstb){
        newkey = rekey_func(key);
        if (newkey in ret){
            ret[newkey] += dstb[key];
        } else {
            ret[newkey] = dstb[key];
        }
    }
    return ret;
}

// newkey = Number(key) * mul + inc , with min and max
function d_rekey(dstb, mul, inc, min=null, max=null){
    var ret = {};
    var newkey = 0;
    for (var key in dstb){
        newkey = Number(key);
        newkey *= mul;
        newkey += inc;
        if (min != null){
            newkey = Math.max(newkey, min);
        }
        if (max != null){
            newkey = Math.min(newkey, max);
        }
        // newkey is auto-converted to string
        if (newkey in ret){
            ret[newkey] += dstb[key];
        } else {
            ret[newkey] = dstb[key];
        }
    }
    return ret;
}

function d_merge(dstb1, dstb2){
    var ret = {};
    for (var key in dstb1){
        ret[key] = dstb1[key];
    }
    for (var key in dstb2){
        if (key in ret){
            ret[key] += dstb2[key];
        } else {
            ret[key] = dstb2[key];
        }
    }
    return ret;
}

function d_get(dstb, key){
    if (key in dstb){
        return dstb[key];
    }
    return 0;
}

function one_shot_damage_distribution(damage, parts_ratios, hit_ratio){
    var one_shot_dd = {};
    for(var i = 0; i < damage.length; i++){
        if (damage[i] in one_shot_dd){
            one_shot_dd[damage[i]] += parts_ratios[i];
        }else{
            one_shot_dd[damage[i]] = parts_ratios[i];
        }
    }
    if (hit_ratio != 1){
        one_shot_dd = d_multiply(one_shot_dd, hit_ratio);
        one_shot_dd[0] = 1 - hit_ratio;
    }
    return one_shot_dd;
}

function damage_distribution_by_shots(total_hp, one_shot_dd, max_shots){
    var ddbs = [{0:1}];
    var curr_dd = null;
    var next_dd = null;
    var temp_dd = null;
    var dmg = 0;

    function _is_done(dd){
        return (Object.keys(dd).length == 1) && (total_hp in dd);
    }

    for(var i = 0; i < max_shots; i++){
        curr_dd = ddbs[ddbs.length - 1];
        if (_is_done(curr_dd)){
            break;
        }
        next_dd = {};
        for (var key1 in curr_dd){
            for(var key2 in one_shot_dd){
                temp_dd = {};
                dmg = Number(key1) + Number(key2);
                temp_dd[dmg] = curr_dd[key1] * one_shot_dd[key2];
                next_dd = d_merge(next_dd, temp_dd);
            }
        }
        next_dd = d_rekey(next_dd, 1, 0, null, total_hp);
        ddbs.push(next_dd);
    }

    if (!_is_done(ddbs[ddbs.length - 1])){
        temp_dd = {};
        temp_dd[total_hp] = 1;
        ddbs.push(temp_dd);
    }
    return ddbs;
}