function negateExpr(expr) {
    for (var i = 0; i < expr.length; i++) {
        var term = expr[i];
        term.coef = -term.coef;
    }
}

function canonical(prob) {
    var nextSlack = 0;

    var objective = prob.objective;
    if (objective) {
        if (objective.dir === 'maximise') {
            negateExpr(objective.expr);
        }
        objective.expr.push({
            sym: '_obj',
            coef: 1
        });
        objective.objVar = '_obj';
    }

    var constraints = prob.constraints;
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            if (constraint.rhs < 0) {
                constraint.rhs = -constraint.rhs;
                negateExpr(constraint.expr);
                if (constraint.op === '<=') {
                    constraint.op = '>=';
                } else if (constraint.op === '>=') {
                    constraint.op = '<=';
                }
            }

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

function getByVar(colIdx, sym) {
    if (!(sym in this.varIndices)) {
        throw new Error('Unknown variable ' + sym);
    }
    return this.rows[colIdx][this.varIndices[sym]];
}

function toMatrix(prob) {
    var nextIndex = 0;
    var varIndices = {};

    var matrix = {
        vars: [],
        varIndices: varIndices,
        rows: [],
        rhs: [],
        getByVar: getByVar
    };

    function addRow(expr) {
        var row = [];
        matrix.rows.push(row);

        for (var j = 0; j < expr.length; j++) {
            var term = expr[j];
            if (!(term.sym in varIndices)) {
                var idx = nextIndex++;
                varIndices[term.sym] = idx;
                matrix.vars.push(term.sym);
            } else {
                idx = varIndices[term.sym];
            }
            row[idx] = term.coef;
        }
        return row;
    }

    var constraints = prob.constraints;
    if (constraints) {
        for (var i = 0; i < constraints.length; i++) {
            var constraint = constraints[i];
            addRow(constraint.expr);
            matrix.rhs.push(constraint.rhs);
        }
    }

    var objective = prob.objective;
    if (objective) {
        var row = addRow(objective.expr);
        matrix.rhs.push(0);
    }

    for (i = 0; i < matrix.rows.length; i++) {
        var row = matrix.rows[i];
        for (j = 0; j < nextIndex; j++) {
            if (!row[j]) {
                row[j] = 0;
            }
        }
    }

    return matrix;
}
