function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            $('#img_profile').attr('src', e.target.result);
        }
        reader.readAsDataURL(input.files[0]);
    }
}

$("#upload_profile").change(function () {
    readURL(this);
});

var control = $("#upload_profile");
$("#delete_file").on("click", function () {
    control.replaceWith(control = control.clone(true));
    $('#img_profile').attr('src', 'userimages/empty_user.jpg');
});