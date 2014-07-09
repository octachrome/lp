function getByVar(mat, colIdx, sym) {
    if (!(sym in mat.varIndices)) {
        throw new Error('Unknown variable ' + sym);
    }
    return mat.rows[colIdx][mat.varIndices[sym]];
}

function padValue(v) {
    var s = '';
    if (v < 10 && v > -10) {
        s += ' ';
    }
    if (v >= 0) {
        s += ' ';
    }
    return s + v;
}

function printMat(mat) {
    var s = "\n";
    for (var c = 0; c < mat.vars.length; c++) {
        s += "  " + mat.vars[c] + " ";
    }
    s += "\n";
    for (var r = 0; r < mat.rows.length; r++) {
        var row = mat.rows[r];
        for (c = 0; c < mat.vars.length; c++) {
            s += padValue(row[c]) + " ";
        }
        s += " : " + padValue(mat.rhs[r]) + "\n";
    }
    return s;
}

function solution(mat) {
    var sol = {};
    var usedRows = {};
    for (var c = 0; c < mat.vars.length; c++) {
        var val = null;
        var row = null;
        for (var r = 0; r < mat.rows.length; r++) {
            var coef = mat.rows[r][c];
            if (coef != 0) {
                if (val === null) {
                    val = mat.rhs[r] / coef;
                    row = r;
                } else {
                    val = null;
                    break;
                }
            }
        }
        if (val !== null && !usedRows[row]) {
            usedRows[row] = true;
            sol[mat.vars[c]] = val;
        } else {
            sol[mat.vars[c]] = 0;
        }
    }
    return sol;
}

function firstInfeasibility(mat) {
    for (var c = 0; c < mat.vars.length; c++) {
        var val = null;
        var row = null;
        for (var r = 0; r < mat.rows.length; r++) {
            var coef = mat.rows[r][c];
            if (coef != 0) {
                if (val === null) {
                    val = mat.rhs[r] / coef;
                    row = r;
                } else {
                    val = null;
                    break;
                }
            }
        }
        if (val < 0) {
            break;
        } else {
            row = null;
        }
    }

    if (row != null) {
        var col = null;
        var max = null;
        for (c = 0; c < mat.vars.length; c++) {
            coef = mat.rows[row][c];
            if (coef > 0) {
                if (max === null || coef > max) {
                    max = coef;
                    col = c;
                }
            }
        }

        if (col === null) {
            throw new Error('Failed to find a suitable pivot var for infeasible row ' + row);
        }
        return {
            row: row,
            col: col,
            sym: mat.vars[col]
        };
    }

    return null;
}

function pivotVar(mat) {
    var p = {
        sym: mat.vars[0],
        col: 0
    };
    var obj = mat.rows[mat.rows.length - 1] ;
    var min = obj[0];
    for (var i = 1; i < mat.vars.length; i++) {
        if (obj[i] < min) {
            p = {
                sym: mat.vars[i],
                col: i
            }
            min = obj[i];
        }
    }
    if (min < 0) {
        return p;
    } else {
        return null;
    }
}

function pivotRow(mat, pivotVar) {
    var index = null;
    var min = null;

    for (var i = 0; i < mat.rows.length - 1; i++) {
        var v = mat.rows[i][pivotVar.col];
        if (v <= 0) {
            continue;
        }
        var r = mat.rhs[i] / v;
        if (min === null || r < min) {
            min = r;
            index = i;
        }
    }

    return index;
}

function augmentedRow(mat, idx) {
    return mat.rows[idx].concat([mat.rhs[idx]]);
}

function cloneMat(mat) {
    var result = {
        vars: mat.vars,
        varIndices: mat.varIndices,
        rows: [],
        rhs: mat.rhs.slice()
    };
    for (var i = 0; i < mat.rows.length; i++) {
        var r = mat.rows[i].slice();
        result.rows.push(r);
    }
    return result;
}

function scaleRow(row, scale) {
    for (var i = 0; i < row.length; i++) {
        row[i] *= scale;
    }
}

function addRow(dest, src) {
    for (var i = 0; i < dest.length; i++) {
        dest[i] += src[i];
    }
}

function pivot(mat, rowIdx, colIdx) {
    var result = cloneMat(mat);
    var pivotRow = mat.rows[rowIdx];
    var pivot = pivotRow[colIdx];

    for (var i = 0; i < mat.rows.length; i++) {
        if (i === rowIdx) {
            continue;
        }
        var row = result.rows[i];
        var val = row[colIdx];
        if (val === 0) {
            continue;
        }
        scaleRow(row, -pivot / val);
        addRow(row, pivotRow);
        result.rhs[i] = result.rhs[i] * -pivot / val + mat.rhs[rowIdx];

        if (result.rhs[i] < 0) {
            scaleRow(row, -1);
            result.rhs[i] = -result.rhs[i];
        }
    }

    return result;
}
