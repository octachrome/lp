function canonical(prob) {
    var nextSlack = 0;

    var constraints = prob.constraints;
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            if (constraint.op === '<=') {
                var coef = 1;
            } else if (constraint.op === '>=') {
                coef = -1;
            } else {
                continue;
            }

            var slackVar = '_s' + nextSlack++;
            constraint.expr.push({
                sym: slackVar,
                coef: coef
            });
            constraint.slackVar = slackVar;
            constraint.op = '=';
        }
    }
    return prob;
}
