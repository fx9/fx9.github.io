function headshot_to_parts(headshot_ratio){
    if (headshot_ratio < 0.0){
        headshot_ratio = 0.0;
    }
    if (headshot_ratio > 1.0){
        headshot_ratio = 1.0;
    }
    var parts_ratios=[
        [0.00, 0.25, 0.15, 0.60],
        [0.10, 0.25, 0.15, 0.50],
        [0.30, 0.45, 0.15, 0.10],
        [0.40, 0.45, 0.10, 0.05],
        [0.45, 0.45, 0.05, 0.05],
        [1.00, 0.00, 0.00, 0.00],
    ];
    var weight=0;
    var ret=[];
    for (var i=0;i<parts_ratios.length -1 ;i++){
        if (parts_ratios[i + 1][0] >= headshot_ratio){
            weight = (headshot_ratio - parts_ratios[i][0]) / (parts_ratios[i + 1][0] - parts_ratios[i][0]);
            ret = [];
            for (var j=0;j<parts_ratios[i].length;j++){
                ret.push(parts_ratios[i][j] + weight * (parts_ratios[i + 1][j] - parts_ratios[i][j]));
            }
            return ret;
		}
	}
    ret = [1.00, 0.00, 0.00, 0.00]
    return ret;
}