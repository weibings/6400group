let textarea = $("#capabilities");
let capability = $("#capability");
$("#addCap").on('click', function(){
	textarea.append(capability.get());
	capability.set();
});

