'use strict';

var paragraphs = document.getElementsByTagName('p');


function selectHTML() {
    try {

        var nNd = document.createElement("em");
        var w = getSelection().getRangeAt(0);
        w.surroundContents(nNd);
        return nNd.innerHTML;
    } catch (e) {
        return getSelection();
    }
}

/*
 * 1. Highlight the selected text 
 * 2. Insert JS for annotation panel 
 * 3. Verify the length of text (min and max) (TODO)
 * 4. Automatically extend to the nearest textual words if the selection contains partial word (TODO)
 	  http://stackoverflow.com/questions/7563169/detect-which-word-has-been-clicked-on-within-a-text
 * 5. Can not highlight a string with existing highlighted words (TODO)
 */
function highlight() {
    var id = generateId();
    var textNode = getSelection().getRangeAt(0);
    if (textNode.toString().length > 1) {
        var sNode = document.createElement("span");
        sNode.id = id;
        sNode.className = "annotate-highlight";

        textNode.surroundContents(sNode);
        var panel = appendPanel(id);

        var parent = getSelection().anchorNode.parentNode;
        while (parent != null && parent.localName.toLowerCase() != "p") {
            parent = parent.parentNode;
        }

        if (parent != null) {
            var pidx = getParagraphIndex(parent);
            console.log(pidx);
            var widx = getWordIndex(parent, textNode);

            sNode.setAttribute('value', pidx + ',' + widx);
        }

        $("#" + id).mouseenter(function() {
            console.log(id + " mouse enter");
            if (panel.is(':hidden')) {
                panel.show();
            }
        });

        return id;
    }
}

function getParagraphIndex(p) {
    var i = 0;
    for (; i < paragraphs.length; i++) {
        if (p.isSameNode(paragraphs[i])) {
            return i;
        }
    }
    return -1;
}


// find the occurrence of the selected text in preceding string. 
function getWordIndex(p, textNode) {
    var precedingRange = document.createRange();
    precedingRange.setStartBefore(p.firstChild);
    precedingRange.setEnd(textNode.startContainer, textNode.startOffset);

    var precedingText = precedingRange.toString();
    var count = 0;
    for (var i = 0; i < precedingText.length;) {
        var idx = precedingText.indexOf(textNode.toString(), i);
        if (idx > 0) {
            count++;
            i = idx + 1;
        } else {
            i++;
        }
    }
    return count;
}


// TODO: show the system's translation in the textarea
function appendPanel(id) {
    var highlightWords = $("#" + id);
    var rect = cumulativeOffset2(id);
    console.log("rect: " + rect.left + " " + rect.top);

    var panelID = id + "_panel";
    var editorID = id + "_editor";

    var panelHtml = '<div id=\"' + panelID + '\" class=\"panel\">';
    panelHtml += '<textarea id=\"' + editorID + '\" style="background:yellow"></textarea><br>';
    panelHtml += '<div class=\"btn-group\" style=\"margin:5px;\">'
    panelHtml += '<button type=\"delete\" class=\"btn btn-info btn-xs\">Delete</button> &nbsp;';
    panelHtml += '<button type=\"cancel\" class=\"btn btn-info btn-xs\">Cancel</button> &nbsp;';
    panelHtml += '<button type=\"submit\" class=\"btn btn-info btn-xs\">Submit</button>';
    panelHtml += '</div></div>';

    $("body").append(panelHtml);

    var panel = document.getElementById(panelID);
    panel.style.position = "absolute";
    panel.style.left = (rect.left - 20) + 'px';
    panel.style.top = (rect.top + 20) + 'px';
    panel.className = "annotate-panel";

    panel = $(panel);

    $("#" + panelID + " button").click(function() {
        var mode = $(this).attr('type');
        if (mode == 'cancel') {
            panel.hide();
        } else if (mode == 'delete') {
            panel.remove();
            highlightWords.contents().unwrap();
        } else {
            // TODO: fix bug
            console.log("save");
            panel.hide();
            saveAnnotation(editorID);
        }
    })

    panel.mouseleave(function() {
        panel.hide();
    })

    return panel;
}


var annotation = {
		id: -1,  // the internal id in database
		user_id: -1, // user id
		ann_id: -1, // annotation id
		selected_text: '',
		translation: '',
		lang: 'zh', // language of the translation, obtained from user's configuration. set default to zh (Chinese)
		paragraph_idx: -1, // paragraph idx
		text_idx: -1, // the idx in the occurrence of the paragraph 
		url: '' // url of the article
	}


// TODO: send to server
function saveAnnotation(editorID) {
	
    
}

// TODO： show all the highlights and annotations
function showAnnotations() {

	
}

// TODO: 
// id is the internal id in database
function deleteAnnotation(id) {
	
}


// TODO: inject annotation panel div as well
function showAnnotation(ann) {
    if (paragraphs.length < ann.paragraph_idx) {
        console.log("layout changed");
        return;
    }

    var para = paragraphs[pidx];
    var innerHtml = para.innerHTML;
    console.log(para);

    var count = 0;
    for (var i=0; i<innerHtml.length; ) {
        var idx = innerHtml.indexOf(ann.selected_text, i);
        if (idx>0) {
            count++;
            if (count==ann.text_idx) {
                var before = innerHtml.slice(0, idx);
                var after = innerHtml.slice(idx+ann.selected_text.length);
                // TODO: inject annotation div as well
                var html = '<span class=\"highlight\">' + ann.selected_text + '</span>';
                para.innerHTML = before + html + after;
                return;
            } 
        } 
        i++;
    }
    console.log("Cannot find the " + text + "  in paragraph " + pid);
	
}


function showPanel() {
    $(this).style.visibility = "visible";
}

function hidePanel() {
    $(this).style.visibility = "hidden";
}

// Duplicate with the cumulativeOffset() in contentscript.js
// TODO: Remove
function cumulativeOffset2(id) {
    var element = document.getElementById(id);
    console.log("id " + element);
    var top = 0,
        left = 0;
    do {
        top += element.offsetTop || 0;
        left += element.offsetLeft || 0;
        element = element.offsetParent;
    } while (element);

    return {
        top: top,
        left: left
    };
}

function generateId() {
    return (new Date).getTime().toString() + Math.floor(Math.random() * 100000)
}


function paintCursor() {
    var cursor = chrome.extension.getURL('highlighter-orange.cur');
    console.log(cursor);
    document.body.style.cursor = "url(" + cursor + "),auto";
}

function unpaintCursor() {
    window.location.reload();
    $('body').unbind("mouseup", 'p');
}



// add listeners
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension");
    if (request.mode == "annotate") {
        console.log("annotate");
        $('body').on("mouseup", 'p', function(e) {
            var id = highlight();
            console.log($("#" + id));
        });
        paintCursor();
    } else {
        console.log(request.mode);
        unpaintCursor();
    }

});
