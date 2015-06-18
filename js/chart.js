var svg = null;
var width = null, height = null;
var xAxis = null, yAxis = null, x = null, y = null;

    var colors = {
        "x1000": d3.rgb("#4800ff"),
        "x500": d3.rgb("#0094ff"),
        "x200": d3.rgb("#00ffff"),
        "x100": d3.rgb("#4cff00"),
        "x50": d3.rgb("#b6ff00"),
        "x20": d3.rgb("#ffd800"),
        "x10": d3.rgb("#ff6a00"),
        "x5": d3.rgb("#ff0000"),
        "prime": d3.rgb("#865f1a"),
        "palindromic": d3.rgb("#ff00dc"),
        "selected": d3.rgb("#b6ff00"),
        "default": d3.rgb("#ffffff")
    };
    //var sizes = {
    //    thousands: 5,
    //    hundreds: 4,
    //    tens: 3.5,
    //    units: 3
    //};

    var margin = { top: 10, right: 50, bottom: 30, left: 100 };

    var color = function (data) {
        if (data.prime)
            return colors["prime"];
        else if (data.palindromic)
            return colors["palindromic"];
        else if (data.biggestmultiplier > 1)
            return colors["x" + data.biggestmultiplier];
        else
            return colors["default"];
    };

    var size = function (data) {
        // return 3px for biggestmultiplier == 1; 6px for biggestmultiplier == 1000;
        return Math.log(data.biggestmultiplier) + 3;
    };


    //svg = d3.select("#chart_area")
    //    .append("svg")
    //        .attr("width", width + margin.left + margin.right)
    //        .attr("height", height + margin.top + margin.bottom)
    //        .append("g")
    //        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var tooltip = d3.select("body")
                        .append("div")
                            .attr("class", "tooltip")
                            .style("opacity", 0);

    $(function () {
        width = $("#chart_area").width() - margin.left - margin.right,
        height = (width / 3) - margin.top - margin.bottom;

        x = d3.scale.linear()
            .range([0, width]);

        y = d3.scale.log()
            .range([height, 0]);

        xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");

        yAxis = d3.svg.axis()
            .scale(y)
            .tickFormat(d3.format("s"))
            .orient("left");

        svg = d3.select("#chart_area")
            .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        d3.csv("./data/q_total.csv", function (error, data) {
        if (error) throw error;

        data.forEach(function (d) {
            d.number = +d.number;
            d.results = +d.results;
            d.biggestmultiplier = function (number) {
                for (var m in _multipliers.reverse())
                    if (number % _multipliers[m] == 0)
                        return _multipliers[m];
                return 1;
            }(d.number);
            d.firstdigit = function (number) {
                var strnumber = number + "";
                return +(strnumber[0]);
            }(d.number);
            d.biggestpower = function (number) {
                for (var index = 2; index < _powers.length; index++)
                    for (var pow in _powers[index].reverse())
                        if (_powers[index][pow] == number)
                            return index;
                return 0;
            }(d.number);
            d.prime = function (number) {
                for (var i in _primes)
                    if (_primes[i] == number)
                        return true;
                return false;
            }(d.number);
            d.palindromic = function (number) {
                var strnumber = number + "";
                var result = true;
                for (var i = 0; i < strnumber.length / 2; i++)
                    result &= strnumber[i] == strnumber[strnumber.length - 1 - i];
                return result
            }(d.number);
        });

        x.domain(d3.extent(data, function (d) { return d.number; })).nice();
        y.domain(d3.extent(data, function (d) { return d.results; })).nice();

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis)
          .append("text")
            .attr("class", "label")
            .attr("x", width)
            .attr("y", -6)
            .style("text-anchor", "end")
            .text("Number");

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
          .append("text")
            .attr("class", "label")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Google Results")

        svg.append("path")
            .attr("class", "regression line");

        svg.selectAll(".dot")
            .data(data)
          .enter().append("circle")
            .attr("class", "dot")
            .attr("number", function (d) { return d.number; })
            .attr("r", "3px")
            .attr("cx", function (d) { return x(d.number); })
            .attr("cy", function (d) { return y(d.results); })
            .style("fill", function (d) { return color(d); })
            .on("mouseover", function (d) {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .5);
                tooltip.html("<b>" + d.number + "</b><p>" + d.results + "</p>")
                    .style("left", (x(d.number) + margin.left + 20) + "px")
                    //.style("text-indent", (x(d.number) + margin.left + 20) + "px")
                    .style("top", (y(d.results) + margin.top - 20) + "px");
                //.style("background-color", color(d.biggestmultiplier));
            })
            .on("mouseout", function (d) {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", function (data) {
                if (data.prime)
                    highlight("primes");
                else if (data.palindromic)
                    highlight("palindromic");
                else if (data.biggestpower > 0)
                    highlight("powers", data.biggestpower);
                else if (data.biggestmultiplier > 1)
                    highlight("multipliers", data.biggestmultiplier);
                else
                    highlight("id", data.number);
                selectNumber(data);
            });

        svg.append("g")
.attr("class", "legend")
.attr("transform", "translate(50,30)")
.style("font-size", "12px")
.call(d3.legend);

    });

});

var highlight = function (mode, value, origin) {
    var dots = svg.selectAll(".dot");
    var _select = $.noop;
    var _size = $.noop;
    var _color = $.noop;
    switch (mode) {
        case "multipliers":
            _select = function (d) {
                return d.biggestmultiplier == value;
            };
            _size = function (d) {
                if (_select(d))
                    return (size(d) + 1) + "px";
                else
                    return "3px";
            };
            _color = function (d) {
                if (_select(d))
                    return colors["x" + value];
                else
                    return d3.rgb("#ffffff");
            };
            break;
        case "powers":
            _select = function (d) {
                return d.biggestpower == value;
            }
            _size = function (d) {
                if (_select(d))
                    return "8px";
                else
                    return "3px";
            };
            _color = function (d) {
                if (_select(d))
                    return colors["pow" + value];
                else
                    return d3.rgb("#ffffff");
            };
            break;
        case "primes":
            _select = function (d) {
                return d.prime;
            }
            _size = function (d) {
                if (_select(d))
                    return "6px";
                else
                    return "3px";
            };
            _color = function (d) {
                if (_select(d))
                    return colors["prime"];
                else
                    return d3.rgb("#ffffff");
            };
            break;
        case "palindromic":
            _select = function (d) {
                return d.palindromic;
            }
            _size = function (d) {
                if (_select(d))
                    return "6px";
                else
                    return "3px";
            };
            _color = function (d) {
                if (_select(d))
                    return colors["palindromic"];
                else
                    return d3.rgb("#ffffff");
            };
            break;
        case "id":
            _select = function (d) {
                return d.number == value;
            }
            _size = function (d) {
                if (_select(d))
                    return "10px";
                else
                    return "3px";
            };
            _color = function (d) {
                if (_select(d))
                    return color(d);
                else
                    return d3.rgb("#ffffff");
            };
            break;
        case "none":
            _select = function (d) {
                return true;
            }
            _size = "3px";
            _color = color;
            break;
    }
    dots.attr("r", _size)
        .style("fill", _color);

    if (mode == "multipliers") {
        // draw regression line
        var filtereddots = dots.filter(_select).select(function (d) {
            return d;
        })[0];
        var regression = exp_regression(filtereddots.map(function (d) { return d.results }));
        var lineFunction = d3.svg.line()
                                 .x(function (d, i) { return x(d.number); })
                                 .y(function (d, i) {
                                     return y(regression[i]);
                                 })
                                 .interpolate("linear");
        svg.selectAll('path')
                .attr('opacity', 1)
                .attr('d', lineFunction(filtereddots))
                .attr("stroke", colors["x" + value]);

    }
    else {
        svg.selectAll('path')
                .attr('opacity', 0);
    }
    if (mode == "id") {
        svg.selectAll('.dot')
            .filter(_select)
            .attr("r", "10px")
            .forEach(function (d) {
                selectNumber(d);
            });
    }

};

var selectNumber = function (data) {
    $("#selectednumber_value").text(data.number);
    $("#selectednumber_value").css("background-color", color(data));
    var desc = "";
    if (data.prime)
        desc += "is a prime number </br>";
    if (data.palindromic)
        desc += "is a palindromic number </br>";
    if (data.biggestmultiplier > 1)
        desc += "is a multiple of " + data.biggestmultiplier + "</br>";
    if (desc == "")
        desc += "has nothing special";
    $("#selectednumber_desc").html(desc);
};

/* http://stackoverflow.com/questions/13590922/how-can-i-use-d3-js-to-create-a-trend-exponential-regression-line */

function square(x) { return Math.pow(x, 2); };

function array_sum(arr) {
    var total = 0;
    arr.forEach(function (d) { total += d; });
    return total;
}

function exp_regression(Y) {
    var n = Y.length;
    var X = d3.range(1, n + 1);

    var sum_x = array_sum(X);
    var sum_y = array_sum(Y);
    var y_mean = array_sum(Y) / n;
    var log_y = Y.map(function (d) { return Math.log(d) });
    var x_squared = X.map(function (d) { return square(d) });
    var sum_x_squared = array_sum(x_squared);
    var sum_log_y = array_sum(log_y);
    var x_log_y = X.map(function (d, i) { return d * log_y[i] });
    var sum_x_log_y = array_sum(x_log_y);

    a = (sum_log_y * sum_x_squared - sum_x * sum_x_log_y) /
        (n * sum_x_squared - square(sum_x));

    b = (n * sum_x_log_y - sum_x * sum_log_y) /
        (n * sum_x_squared - square(sum_x));

    var y_fit = [];
    X.forEach(function (x) {
        y_fit.push(Math.exp(a) * Math.exp(b * x));
    });

    return y_fit;
}
/*  */
