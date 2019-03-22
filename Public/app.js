$(".save-article").on("click", function () {
    var thisId = $(this).attr("id");
    var savedArticle = $(this).data();
    savedArticle.saved = true;

    $.ajax("/saved/" + thisId, {
        type: "PUT",
        data: savedArticle
    }).then(
        function (data) {
            console.log(data)
            location.reload();
            alert("clicked")
        }
    );
});

$(".delete-article").on("click", function () {
    var thisId = $(this).attr("id");
    var deleteArticle = $(this).data();
    deleteArticle.saved = false;

    $.ajax("/saved/" + thisId, {
        type: "PUT",
        data: deleteArticle
    }).then(
        function (data) {
            console.log(data)
            location.reload();
            alert("deleted")
        }
    );
});

$(document).on("click", ".add-comments", function () {
    // Empty the notes from the note section
    $("#comment-text").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("id");
    console.log(thisId)
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
    // With that done, add the note information to the page
    window.location.replace("/articles/" + thisId)
});

$(".submit-comments").on("click", function () {
    var thisId = $(this).attr("data-id");
    alert("submit hit")
    $.ajax({
        method: "POST",
        url: "/articles/" + thisId,
        data: {
            // Value taken from title input
            // title: $("#title-input").val(),
            // Value taken from note textarea
            body: $("#comment-text").val()
        }
    })
        .then(function (data) {
            // Log the response
            console.log(data);
            window.location.replace("/articles/" + data._id);
        });
    // Also, remove the values entered in the input and textarea for note entry
    // $("#title-input").val("");
    $("#comment-text").val("");
});



