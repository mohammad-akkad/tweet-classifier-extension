$(document).ready(function ($) {
    setTimeout(function () {
        construct();
    }, 3000);

    function construct() {
        if (jQuery('.ak-classified').length < 1) {
            var olength = jQuery("#stream-items-id").children('li').length;
            addClassifiyButton();
            classifiy();
            addCss();
            addEventListener();
        }

    }
    /* add a button next to tweet button */
    function addClassifiyButton() {
        jQuery('.timeline-tweet-box .TweetBoxToolbar > .TweetBoxToolbar-tweetButton > .add-tweet-button').before('<button class="classifier-button-tweet">classify</button>');
        $('.classifier-button-tweet').before('<span class="classifier-button-tweet" hidden style="right:8%"></span>');
    }
    /* loop through all the tweets in the page and put them into array and send them to the server */
    function classifiy() {
        var tweetData = [];

        olength = jQuery("#stream-items-id").children('li').length;
        jQuery("#stream-items-id").children('li').each(function (index, element) {
            if (!jQuery(element).hasClass('ak-classified')) {
                jQuery(element).addClass('ak-classified');
                var text = jQuery('.js-original-tweet > .content > .js-tweet-text-container > .TweetTextSize', element).text()
                var id = jQuery(element).attr("id")
                tweetData.push({
                    'id': id,
                    'text': text
                })

            }
        });
        $.ajax({
            type: "POST",
            url: "https://mohamadakkad.pythonanywhere.com/myapp/classifiy/",
            // The key needs to match your method's input parameter (case-sensitive).
            data: JSON.stringify({
                Tweet: tweetData
            }),
            contentType: "application/json; charset=utf-8",
            dataType: 'json',
            success: function (data) {
                afterSuccess(data);
                addEventListener();
            },
        });
    }
    /* add a style tag that will be used for different purposes */ 
    function addCss() {
        jQuery('head').append('<style id = "classifier-custom-style">' +
            '.classifier-icon {width: 100%;height: 100%;}' +
            '.classifier-icon-inactive { opacity: 0.4;}' +
            '.classifier-icon-active { opacity: 1;}' +
            '.classifier-button { width: 5%;margin-left: 2%;}' +
            '.classifier-button-tweet {border-radius: 100px;box-shadow: none;cursor: pointer;' +
            'font-size: 14px;font-weight: bold;line-height: 20px;padding: 6px 16px;position: relative;' +
            'text-align: center;white-space: nowrap;background-color: #4AB3F4;border-color: transparent;' +
            'right: 6%;color: #fff;}' +
            '.classifier-div-blur {filter: blur(5px);}' +
            '.classifier-hidden {display:none}' +
            '.classifier-warning {text-align: center;position: absolute;top: 40%;right: 0%;font-size: 27px;padding: 2%;color: red;}' +
            '</style>');
    }
    /* add different event listener (for genral page changes and for when tweet are added) */ 
    function addEventListener() {
        $('#stream-items-id').on('DOMNodeInserted', 'li', function (e) {
            if (olength < jQuery("#stream-items-id").children('li').length) {
                classifiy();
                $('#stream-items-id').off('DOMNodeInserted');
            }
        });
        var targetNode = document.getElementById('stream-items-id');

        // Options for the observer (which mutations to observe)
        var config = {
            attributes: true,
            childList: true,
            subtree: true
        };
        var changed = false;
        // Callback function to execute when mutations are observed
        var callback = function (mutationsList) {
            for (var mutation of mutationsList) {
                if (mutation.type == 'childList') {
                    changed = true;
                }
            }
            if (changed) {
                construct();
                changed = false;
            }
        };

        // Create an observer instance linked to the callback function
        var observer = new MutationObserver(callback);

        // Start observing the target node for configured mutations
        observer.observe(targetNode, config);

    }
    /* add on click event to different buttons */
    function addOnclick() {

        $('.classifier-unhide').on('click', function () {
            jQuery(this).parent().parent().find('.classifier-div-blur').removeClass('classifier-div-blur');
            jQuery(this).parent().addClass('classifier-hidden');
        });

        jQuery('.classifier-button').on('click', function () {
            console.log(1);
            var buttonParent = $(this).parent().parent();
            var tweetText = $('.js-tweet-text-container > .TweetTextSize', buttonParent).text();
            var tweetClass = $(this).attr('data-type');
            if ($('img', this).hasClass('classifier-icon-inactive')) {
                $('.classifier-icon-active', buttonParent).addClass('classifier-icon-inactive');
                $('.classifier-icon-active', buttonParent).removeClass('classifier-icon-active');
                $('img', this).removeClass('classifier-icon-inactive');
                $('img', this).addClass('classifier-icon-active');

            }
            tweetData = {
                'class': tweetClass,
                'text': tweetText,
                'id': buttonParent.parent().parent().attr('id')
            };
            $.ajax({
                type: "POST",
                url: "https://mohamadakkad.pythonanywhere.com/myapp/add/",
                // The key needs to match your method's input parameter (case-sensitive).
                data: JSON.stringify({
                    Tweet: tweetData
                }),
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function () {

                },
            });
        });
        jQuery('.classifier-button-tweet').on('click', function () {
            var tweetData = [];
            tweetText = $('#tweet-box-home-timeline').text();
            tweetData.push({
                'id': '1',
                'text': tweetText
            });
            $.ajax({
                type: "POST",
                url: "https://mohamadakkad.pythonanywhere.com/myapp/classifiy/",
                // The key needs to match your method's input parameter (case-sensitive).
                data: JSON.stringify({
                    Tweet: tweetData
                }),
                contentType: "application/json; charset=utf-8",
                dataType: 'json',
                success: function (data) {
                    $('span.classifier-button-tweet').text(data[0].class);
                    $('span.classifier-button-tweet').show();
                },
            });
        });
    }
    /* place the buttons with the correct class for each tweet on top of it */ 
    function afterSuccess(tweets) {
        for (i = 0; i < tweets.length; i++) {
            tweetHeaderPath = '.js-original-tweet > .content > .stream-item-header > .time';
            jQuery('#' + tweets[i].id).addClass('classified-' + tweets[i].class);
            jQuery('#' + tweets[i].id).append('<div class="classifier-hidden classifier-warning"> this tweet was hidden cause it might contain materials related to ' + tweets[i].class + ', <a class="classifier-unhide">click</a> to show</div>');
            jQuery(tweetHeaderPath, '#' + tweets[i].id)
                .after('<button class = "classifier-button" data-type="sexism"><img class="classifier-icon classifier-sexism classifier-icon-inactive" title="Sexism"' +
                    'src="https://cdn.iconscout.com/icon/free/png-256/s-characters-character-alphabet-letter-36031.png"></button>');
            jQuery(tweetHeaderPath, '#' + tweets[i].id)
                .after('<button class = "classifier-button" data-type="none"><img class="classifier-icon classifier-none classifier-icon-inactive" title="Neutral" ' +
                    'src="https://cdn.iconscout.com/icon/free/png-256/n-characters-character-alphabet-letter-36030.png"></button>');
            jQuery(tweetHeaderPath, '#' + tweets[i].id)
                .after('<button class = "classifier-button" data-type="racism"><img class="classifier-icon classifier-racism classifier-icon-inactive" title="Racism" ' +
                    'src="https://cdn.iconscout.com/icon/free/png-256/r-characters-character-alphabet-letter-36029.png"></button>');

            jQuery('.classifier-' + tweets[i].class, '#' + tweets[i].id).removeClass('classifier-icon-inactive');
            jQuery('.classifier-' + tweets[i].class, '#' + tweets[i].id).addClass('classifier-icon-active');

        }
        addOnclick();
        hiedTweet();
    }
     /* hide tweets according to the class that was selected by user */ 
    function hiedTweet() {

        if ($.cookie("classifier-sexism") == "true") {
            hideSexism();
        }

        if ($.cookie("classifier-racism") == "true") {
            hideRacism();
        }
    }
     /* recive messages form the extension */ 
    chrome.runtime.onMessage.addListener(
        function (request, sender, sendResponse) {
            $.cookie("classifier-sexism", request.sexism, {
                expires: 356
            });
            $.cookie("classifier-racism", request.racism, {
                expires: 356
            });
            if (request.sexism == true) {
                hideSexism();
            } else {
                unhideSexism();
            }
            if (request.racism == true) {
                ;
                hideRacism();
            } else {
                unhideRacism();
            }
        });

    function hideSexism() {
        jQuery('.classified-sexism .js-actionable-tweet').addClass('classifier-div-blur');
        jQuery('.classified-sexism .classifier-hidden').removeClass('classifier-hidden');

    }

    function unhideSexism() {
        jQuery('.classified-sexism .js-actionable-tweet').removeClass('classifier-div-blur');
        jQuery('.classified-sexism .classifier-warning').addClass('classifier-hidden');

    }

    function hideRacism() {
        jQuery('.classified-racism .js-actionable-tweet').addClass('classifier-div-blur');
        jQuery('.classified-racism .classifier-hidden').removeClass('classifier-hidden');

    }

    function unhideRacism() {
        jQuery('.classified-racism .js-actionable-tweet').removeClass('classifier-div-blur');
        jQuery('.classified-racism .classifier-warning').addClass('classifier-hidden');

    }
});