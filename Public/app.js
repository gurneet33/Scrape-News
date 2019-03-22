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
    console.log(thisId
    )
    // Now make an ajax call for the Article
    $.ajax({
        method: "GET",
        url: "/articles/" + thisId
    })
        // With that done, add the note information to the page
        .then(function (data) {
            console.log(data);
            alert("trying to comment eh!")
            // The title of the article

            // If there's a note in the article
            if (data.notes) {
                // Place the title of the note in the title input
                $("#title-input").val(data.notes.title);
                // Place the body of the note in the body textarea
                $("#comment-body").val(data.notes.body);
            }
        });
});



