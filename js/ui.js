$(function () {


    //$("#buttons").append(
    //    "<input class=\"poweroftwo\" type=\"button\" value=\"2\" text=345 />"
    //);
    //$("#buttons").append(
    //    "<input class=\"poweroftwo\" type=\"button\" value=\"1\" />"
    //);
    //$("#buttons").append(
    //    "<input class=\"prime\" type=\"button\" value=\"1\" />"
    //);
    $(".btn.multiplier").on("click", function (e) {
        highlight("multipliers", $(this).attr("value"));
    });
    //$(".btn.firstdigit").on("click", function (e) {
    //    highlight("firstdigit", $(this).attr("value"));
    //});
    $(".btn.power").on("click", function (e) {
        highlight("powers", $(this).attr("value"));
    });
    $(".btn.find").on("click", function (e) {
        highlight("id", $("input#findnumber").val()-0);
    });
    $(".btn.prime").on("click", function (e) {
        highlight("primes");
    });
    $(".btn.palindromic").on("click", function (e) {
        highlight("palindromic");
    });
    $(".btn.reset").on("click", function (e) {
        highlight("none");
    });
});
