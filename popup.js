var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
	anHttpRequest = new XMLHttpRequest();
	anHttpRequest.onreadystatechange = function() { 
	    if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
		aCallback(anHttpRequest.responseText);
	}
	anHttpRequest.open( 'GET', aUrl, true );						
	anHttpRequest.send( null );
    }
}

var url_front = 'http://young-cliffs-9171.herokuapp.com/';
//var url_front = 'http://localhost:3000/';

var userAccount = '';
var isWorking = '';
var categoryParameter = '';
var wordDisplay = '';
var wordsReplaced = '';
var websiteSetting = '';

function onWindowLoad() {
    chrome.storage.sync.get(null, function(result){
	    userAccount = result.userAccount;
	    console.log('user acc: '+ result.userAccount);

	    if (userAccount == undefined){
            var d = new Date();
            userAccount = 'id' + d.getTime() + '_1';
            chrome.storage.sync.set({'userAccount': userAccount}, function() {});
	    }
	    console.log('userAccount ' + userAccount);

	    isWorking = result.isWorking;
	    if (isWorking == undefined) {
            isWorking = 1;
            chrome.storage.sync.set({'isWorking': isWorking});
	    }
	    console.log('isWorking '+isWorking);
	    if (isWorking == 0) {
            document.getElementById('turnOn').className = 'btn btn-default';
            document.getElementById('turnOff').className = 'btn btn-primary active';
            
            $('.website-checkbox input').prop('disabled', true);
	    }
	    else {
            document.getElementById('turnOn').className = 'btn btn-primary active';
            document.getElementById('turnOff').className = 'btn btn-default';
            $('.website-checkbox input').prop('disabled', false);
	    }

	    wordDisplay = result.wordDisplay;
	    if (wordDisplay == undefined) {
            wordDisplay = 0;
            chrome.storage.sync.set({'wordDisplay': wordDisplay});
	    }
	    console.log('wordDisplay '+wordDisplay);
	    if (wordDisplay == 0) {
            document.getElementById('displayEnglish').className = 'btn btn-default';
            document.getElementById('displayChinese').className = 'btn btn-primary active';
	    }
	    else{
            document.getElementById('displayEnglish').className = 'btn btn-primary active';
            document.getElementById('displayChinese').className = 'btn btn-default';
	    }

	    wordsReplaced = result.wordsReplaced;
	    console.log('wordsReplaced '+wordsReplaced);
	    if (wordsReplaced == undefined) {
            wordsReplaced = 2;
            console.log('Set to default wordsReplaced setting');
            chrome.storage.sync.set({'wordsReplaced': wordsReplaced});
	    }
        else {
		//document.getElementById('wordsReplaced').value = wordsReplaced;
            $('#wordsReplaced').slider({
		    precision: 2,
		    value: wordsReplaced // Slider will instantiate showing 8.12 due to specified precision
            });
        }

    websiteSetting = result.websiteSetting;
    console.log('websiteSetting '+websiteSetting);
    if(websiteSetting == undefined){
        websiteSetting = 'cnn.com';
        console.log('Set to default website setting');
        chrome.storage.sync.set({'websiteSetting': websiteSetting});
    }
    if(websiteSetting.indexOf('cnn.com') !== -1)
    document.getElementById('inlineCheckbox1').checked = true;
    if(websiteSetting.indexOf('chinadaily.com.cn') !== -1)
    document.getElementById('inlineCheckbox2').checked = true;
    if(websiteSetting.indexOf('bbc.com') !== -1)
    document.getElementById('inlineCheckbox3').checked = true;
    if(websiteSetting.indexOf('all') !== -1)
    document.getElementById('inlineCheckbox4').checked = true;



    var remembered = new HttpClient();
    var answer;


    document.getElementById('learnt').innerHTML = '-';
    document.getElementById('toLearn').innerHTML = '-';

    remembered.get(url_front+'/getNumber?name='+userAccount, function(answer) {
            var obj=JSON.parse(answer);
            if('learnt' in obj) {
                document.getElementById('learnt').innerHTML = obj['learnt'];
            }
            if('toLearn' in obj) {
                document.getElementById('toLearn').innerHTML = obj['toLearn'];
            }
        });
    });

    $('#wordsReplaced').on('slide', function(slideEvt) {
	chrome.storage.sync.set({'wordsReplaced': slideEvt.value});
	});


    $('input').change(function() {

        websiteSetting = '';
        if (document.getElementById('inlineCheckbox1').checked == true) {
            if(websiteSetting !== '')
                websiteSetting += '_';
            websiteSetting+= document.getElementById('inlineCheckbox1').value;
        }

        if (document.getElementById('inlineCheckbox2').checked == true) {
            if(websiteSetting !== '')	
                websiteSetting += '_';
            websiteSetting += document.getElementById('inlineCheckbox2').value;
        }
        if (document.getElementById('inlineCheckbox3').checked == true) {
            if(websiteSetting !== '')
                websiteSetting += '_';
            websiteSetting+= document.getElementById('inlineCheckbox3').value;
        }
        
        // Comment out temporarily for now, to prevent the use of 'All website'
        /*if(document.getElementById('inlineCheckbox4').checked == true) {
            if(websiteSetting !== '')
            websiteSetting += '_';
            websiteSetting+= document.getElementById('inlineCheckbox4').value;
        }*/

        chrome.storage.sync.set({'websiteSetting': websiteSetting});
        chrome.storage.sync.get('websiteSetting', function(result){
            userAccount = result.websiteSetting;
            console.log('user websiteSetting: '+ result.websiteSetting);
        });
    });

    $('.btn-toggle ').click(function() {

        if ($(this).attr('id') == 'onoff') {
            if (isWorking == 1) {
                isWorking = 0;
                chrome.storage.sync.set({'isWorking': isWorking});
                $('.website-checkbox input').prop('disabled', true);
            }
            else {
                isWorking = 1;
                chrome.storage.sync.set({'isWorking': isWorking});
                $('.website-checkbox input').prop('disabled', false);
            }

            chrome.storage.sync.get(null, function(result){
                isWorking = result.isWorking;
                console.log('user isworking: '+ result.isWorking);
            });
        }

        if($(this).attr('id') == 'englishchinese') {
            if(wordDisplay == 1){
                wordDisplay = 0;
                chrome.storage.sync.set({'wordDisplay': wordDisplay});
            }
            else {
                wordDisplay = 1;
                chrome.storage.sync.set({'wordDisplay': wordDisplay});
            }

            chrome.storage.sync.get(null, function(result){
                wordDisplay = result.wordDisplay;
                console.log('user isworking: '+ result.wordDisplay);
            });
        }

        $(this).find('.btn').toggleClass('active');	

        if ($(this).find('.btn-primary').size()>0) {
            $(this).find('.btn').toggleClass('btn-primary');
        }
        if ($(this).find('.btn-danger').size()>0) {
            $(this).find('.btn').toggleClass('btn-danger');
        }
        if ($(this).find('.btn-success').size()>0) {
            $(this).find('.btn').toggleClass('btn-success');
        }
        if ($(this).find('.btn-info').size()>0) {
            $(this).find('.btn').toggleClass('btn-info');
        }

        $(this).find('.btn').toggleClass('btn-default');
    });

    $('.btn-block').click(function(){
        window.open(url_front+'displayHistory?name='+userAccount);
        });
    //http://testnaijia.herokuapp.com/settings?name='+userAccount'
    $('#setting').click(function(){
        window.open(url_front+'settings?name='+userAccount);
        });
    //http://testnaijia.herokuapp.com/howtouse
    $('#documentation').click(function(){
        window.open(url_front+'howtouse');
        });
}

window.onload = onWindowLoad;
