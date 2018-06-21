//以subtitle作为需要点击的class
function initToggle() {
	$(".subtitle").click(function() {
		var t = $(this).parent().parent().next("tbody");
		t.toggle();
		if (t.get(0)) {
			if (t.get(0).style.display == "none") {
				$(this).get(0).className = "subtitleClose";
			} else {
				$(this).get(0).className = "subtitle";
			}
		}
	});
	$(".subtitleClose").click(function() {
		var t = $(this).parent().parent().next("tbody");
		t.toggle();
		if (t.get(0)) {
			if (t.get(0).style.display == "block") {
				$(this).get(0).className = "subtitle";
			} else {
				$(this).get(0).className = "subtitleClose";
			}
		}
	});
}