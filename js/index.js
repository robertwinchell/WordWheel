var randLetter = function(){
    var weight = 1.5, // Possibility to return a "weight" letter (J, Q, X, Z, F, H, K), bigger is less possibility.
        letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));

    if (letter == 'J' || letter == 'Q' || letter == 'X' || letter == 'Z' || letter == 'F' || letter == 'H' || letter == 'K') {
        if (!!Math.round(Math.random() * weight)) {
            return randLetter();
        }
    }

    return letter;
};

// global variables of games
var maxWordCount = 50;
var gameMode, // 'single' or 'multi'
    timerEnabled,
    letters, // 0 - center letter, 1~8 - others
    matchWords, // checked from defaultWords in words.js file
    curWord,
    remainTime,
    timerId,
    usedHint,
    curUser,
    singleHintWord,
    score = {'owner': 0, 'member': 0},
    successWords;
// elements of game area
var ownerInputBox,
    ownerListPan,
    ownerScoreElement,
    ownerErrorElement,
    memberInputBox,
    memberListPan,
    memberScoreElement,
    memberErrorElement,
	onlyErrorElement
    ;

function setPlayers (numPlayers) {
	console.log("setPlayers, numPlayers = " + numPlayers);
	
	if (numPlayers == "one") {
		$('#one').addClass('active');
		$('#two').removeClass('active');
		console.log("set one active");
	}
	else {
		$('#two').addClass('active');
		$('#one').removeClass('active');
		console.log("set two active");				
	}
		
}

function setTimer (timer) {
	console.log("setTimer, timer = " + timer);
	
	if (timer == "on") {
		$('#timerOn').addClass('active');
		$('#timerOff').removeClass('active');
		console.log("set timer on active");
	}
	else {
		$('#timerOff').addClass('active');
		$('#timerOn').removeClass('active');
		console.log("set timer off active");				
	}
		
}

function start_game(){
	var mode = "single";
	if (document.getElementById('two').classList.contains ("active"))
		mode="multi";
	
	$('#menuBar').removeClass('dis-none');		
    $('#end-game').removeClass('dis-none');
    $('#home-area').addClass('dis-none');
    $('#game-area').removeClass('dis-none');

    gameMode = mode;
//    timerEnabled = $('#timer-check').prop('checked');
	timerEnabled = (document.getElementById('timerOn').classList.contains ("active"));
	console.log ("start_game, timerEnabled = " + timerEnabled);
	
    if (mode == 'single'){
        $('#member-panel').addClass('dis-none');
        $('.hint-panel').addClass('dis-none');
    }
    else{
        $('#member-panel').removeClass('dis-none');
        $('.hint-panel').removeClass('dis-none');
    }
    init_game();
}

function renew(){
    $('#menuBar').addClass('dis-none');
    $('#end-game').addClass('dis-none');
    $('#home-area').removeClass('dis-none');
    $('#game-area').addClass('dis-none');
    if (timerId)
        clearInterval(timerId);
    $('#timer-label').html('&nbsp;').addClass('dis-none');
}

function force_end_game() {
    if (timerEnabled)
        clearInterval(timerId);

    var menuOuter = $('<div>').addClass('menudivOuter');
	
    var menu  = $('<div>').addClass('menudiv');
    
	if (gameMode == 'single') {
        menu.append('<h2 class="owner single">Team A Score: ' + score.owner + '</h2>');
    } else {
        menu.append('<h2 class="owner">Team A Score: ' + score.owner + '</h2>');
        menu.append('<h2 class="member">Team B Score: ' + score.member + '</h2>');
    }

    menu.append('<h3>Some additional words</h3>');

	var allWords = new Array();
	var numOfWords = 0;
	var currentWordNum = 0;

	
    $.each(matchWords, (function(i, v) {
		allWords[numOfWords] = v;
		numOfWords++;
    }));

	// temp code until we have no more than 50 matchWords
	if (numOfWords > 50)
		numOfWords = 50;
			
	for (columns=0; columns <5; columns++) {	
		var columnString = "";		
		for (row=0; row<(numOfWords/5); row++) {
//		for (row=0; row<=10; row++) {
			if (currentWordNum < numOfWords)
			{
				columnString+="<p>" + allWords[currentWordNum].toLowerCase() + "</p>";
			}
			currentWordNum++;			
		}
	    menu.append ("<div class='wordColumn'>" + columnString + "</div>");		
	}

//    var newBtn = $('<button class="btn btn-danger">').text('New Game')
//       .click(function() {
//            menu.remove();
//            renew();
//        });

//    var retryBtn = $('<button class="btn btn-success ml-20">').text('Play Again')
//        .click(function(){
//            menu.remove();
//           init_game();
//        });

	var closeButtonDiv = $('<div>').addClass('closeButtonDiv');

    var closeBtn = $('<button class="coreBtn action">').text('Close')
        .click(function(){
            menu.remove();
            init_game();
			renew();
        });
	closeButtonDiv.append(closeBtn);
 //   menu.append('<h2>&nbsp;</h2>');

//    menu.append(newBtn);
    menu.append(closeButtonDiv);

//    menuOuter.append(menu);
//	$('body').append(menuOuter);
	$('body').append(menu);	
}

function init_game(){
    // clear score
    score.owner = 0;
    score.member = 0;
    usedHint = {owner: 0, member: 0};
    curWord = {owner: '', member: ''};
    successWords = {owner: [], member: []};
    curUser = 'owner';
    singleHintWord = '';

    // generate random 9 letters
    letters = [];
    for (var i=0; i<9; i++){
        while(1){
            var char = randLetter();
            if (letters.indexOf(char) == -1){
                // Check pairs weight
                switch (char) {
                    case 'W':
                        if (letters.indexOf('H') == -1)
                            continue;
                        break;
                    case 'S':
                        if (letters.indexOf('T') == -1)
                            continue;
                        break;
                    case 'T':
                        if (letters.indexOf('S') == -1)
                            continue;
                        break;
                    case 'Q':
                        if (letters.indexOf('U') == -1)
                            continue;
                }

                if (i != 0){
                    letters.push(char);
                    break;
                }
                else if(char == 'A' || char == 'E' || char == 'I' || char == 'O' || char == 'U' || char == 'Y'){
                    letters.push(char);
                    break;
                }
            }
        }
        $('#letter' + i).html(letters[i]);
    }

    // get matched words
    matchWords = [];
	// temp code to reduce word count to test winning screen
	var wordCount = 0;
    for (var i=0; i<defaultWords.length; i++)
	{
        var word = defaultWords[i].toUpperCase();
        if (word.length < 10 && word.length>2 && word.indexOf(letters[0])>-1)
		{
            var addFlag = true;
            for (var j=0; j<word.length; j++)
			{
                var curLetter = word[j];
                if (letters.indexOf(curLetter) == -1)
				{
                    addFlag = false;
                    break;
                }
                else if (word.indexOf(curLetter) != word.lastIndexOf(curLetter))
				{
                    addFlag = false;
                    break;
                }
            }
			
//            if (addFlag)
//               	matchWords.push(word);
            if (addFlag /*&& wordCount < maxWordCount*/)
			{
              	matchWords.push(word);
				wordCount++;
			}
        }
    }
    console.log("init_game, defaultWords.length = " + defaultWords.length + ", matchWords = " + matchWords);

    // init elements
    ownerInputBox = $('#owner-input');
    ownerListPan = $('#owner-list-pan');
    ownerScoreElement = $('#owner-score');
    ownerErrorElement = $('#owner-error');
    memberInputBox = $('#member-input');
    memberListPan = $('#member-list-pan');
    memberScoreElement = $('#member-score');
    memberErrorElement = $('#member-error');
    onlyErrorElement = $('#only-error');	

    ownerInputBox.val('');
    ownerListPan.empty();
    memberInputBox.val('');
    memberListPan.empty();

    $('#hint-label').html('');
    $('#hint-block').html('');	
    $("input:checkbox").prop('checked', false);

    if (gameMode == 'single'){
        $('#circle-panel').addClass('single');
        $('#letter0').addClass('single');
        $('.hint-control-panel').addClass('single');
        $('.remain-label').addClass('single');
        $('.timer-label').addClass('single');
        $('.currentWordGroup').addClass('single');	
        $('.error-label').addClass('single');		
        $('.hints').addClass('single');	
        $('.hint-label').addClass('single');	
        $('.score-label').addClass('single');										
    }
    else{
        $('#circle-panel').removeClass('single');
        $('#letter0').removeClass('single');
        $('.hint-control-panel').removeClass('single');
        $('.remain-label').removeClass('single');
        $('.timer-label').removeClass('single');
        $('.currentWordGroup').removeClass('single');		
        $('.error-label').removeClass('single');			
        $('.hints').removeClass('single');	
        $('.hint-label').removeClass('single');
        $('.score-label').removeClass('single');																
    }
    $('.role-panel').find('.active').removeClass('active');


    if (timerEnabled){
        $('#timer-label').removeClass('dis-none');

        remainTime = defaultRemainTime;
        timerId = setInterval(function(){
            remainTime --;
            var m = Math.floor(remainTime/60),
                s = remainTime % 60;
            $('#timer-label').html((m<10 ? '0' + m : m) + ' : ' + (s<10 ? '0' + s : s));
            if (remainTime == 0)
                end_game();
        }, 1000);		
// temp code to lose faster        }, 1000);
    }

    refresh_views();
}

function end_game(){
    if (timerEnabled)
        clearInterval(timerId);

    var text = '';
	var won = false;
    if (gameMode == 'single'){
        if (matchWords.length > 0)
		 	text = "Sorry.<br />You did not win.";
        else
		{
            text = 'You won!';
			won = true;	
		}
    }
    else {
		won = true;
        if (score.owner > score.member)
            text = 'Team A won!';
        else if (score.owner == score.member)
            text = 'Draw!';
        else
            text = 'Team B won!';
    }

//    var menu = $("<div>").addClass("menudiv");
	var menu;
	if (won)
		menu = $("<div>").addClass("menudiv winner");
	else
		menu = $("<div>").addClass("menudiv loser");
		
    menu.append("<h2>" + text + "</h2>");
    var newBtn = $("<button class='btn btn-danger'>").text("New Game")
        .click(function() {
            menu.remove();
            renew();
        });
 //   menu.append(newBtn);
    var retryBtn = $("<button class='btn btn-success ml-20'>").text("Play Again")
        .click(function(){
            menu.remove();
            init_game();
        });
//    menu.append(retryBtn);

	var closeButtonDiv = $('<div>').addClass('closeButtonDiv');
    var closeBtn = $('<button class="coreBtn action">').text('Close')
        .click(function(){
            menu.remove();
            init_game();
			renew();
        });
	closeButtonDiv.append(closeBtn);
    menu.append(closeButtonDiv);
    $("body").append(menu);

}

function click_letter(index){
    var targetElement = (index == 0) ? $('#letter0') : $('#letter' + index).parent('li');
    targetElement.toggleClass('active');
    var char = letters[index];
    console.log(char);
    if (gameMode == 'single'){
        if (targetElement.hasClass('active'))
            curWord.owner += char;
        else{
            var charIndex = curWord.owner.indexOf(char);
            var tArr = curWord.owner.split('');
            tArr.splice(charIndex, 1);
            curWord.owner = tArr.join('');
        }
        ownerInputBox.val(curWord.owner);
    }
    else {
        if (targetElement.hasClass('active'))
            curWord[curUser] += char;
        else{
            var charIndex = curWord[curUser].indexOf(char);
            var tArr = curWord[curUser].split('');
            tArr.splice(charIndex, 1);
            curWord[curUser] = tArr.join('');
        }

        if (curUser == 'owner')
            ownerInputBox.val(curWord[curUser]);
        else
            memberInputBox.val(curWord.member);
    }
}

function refresh_views(){
//    ownerScoreElement.html('Score: ' + score.owner);
    ownerScoreElement.html(score.owner);
    memberScoreElement.html(score.member);
    if(matchWords.length > 0)
//        $('#remain-label').html(matchWords.length + ' words are remaining.');
        $('#remain-label').html('Remaining words: ' + matchWords.length );
    else {
        $('#remain-label').html('All words are searched.');
        end_game();
    }
}

function refresh_list_pan(role){
    var targetObj = role == 'owner' ? ownerListPan : memberListPan;
    var arr = successWords[role].sort(function(a,b){return a>b});
    targetObj.empty();
    for (var i=0; i<arr.length; i++){
        targetObj.append($('<div class="mt-5 pl-10 pr-10">').html(arr[i]));
    }
}

function submit_word(user){
   	console.log("submit_word, 1 user = " + user);				
    if (!curWord[user] || user != curUser)
        return;
   	console.log("submit_word, 2 user = " + user);
					
	singleHintWord = '';
//    $('#hint-label').html('');
    $('#hint-block').html('');	
	
    if(gameMode != 'single'){
        curUser = (curUser == 'owner') ? 'member' : 'owner';
        $('.name-label').toggleClass('active');
		$('.currentWordGroup').toggleClass('active');
	   	console.log("submit_word, gameMode != single");		
    }

    var err = null, index;
    if (user == 'owner'){
	   	console.log("submit_word, user == owner");	
		if(gameMode != 'single'){
      	  	$('.center-hub').removeClass('owner');
        	$('.center-hub').addClass('member');
    		console.log("submit_word, should be owner, user = " + user);				
		}
		
        if (curWord.owner.indexOf(letters[0])<0){
            err = 'You must use center character: ' + letters[0] + '.';
        }
        else if (matchWords.indexOf(curWord.owner)<0){
            err = curWord.owner + ' is not a valid word.'
        }

        if (err){
			console.log("submit_word, user==owner, if err, err = " + err);
            //if(gameMode != 'single'){
                curWord.owner = '';
                ownerInputBox.val('');
                $('.role-panel').find('.active').removeClass('active');
            //}
            
			console.log("submit_word, owner, calling display_error(ownerErrorElement = " + ownerErrorElement + ", err = " + err + ")");
//			return display_error(ownerErrorElement, err);
			return display_error(onlyErrorElement, err);			
        }
        else {
	   		console.log("submit_word, user == owner else no error");
            successWords.owner.push(curWord.owner);
            refresh_list_pan('owner');
            //ownerListPan.append($('<div class="mt-5 pl-10 pr-10">').html(curWord.owner));
            //ownerListPan.scrollTop(10000);

            score.owner += (curWord.owner.length * 10);
            index = matchWords.indexOf(curWord.owner);
            curWord.owner = '';
            ownerInputBox.val('');
            $('.role-panel').find('.active').removeClass('active');
        }
    }
    else {
		$('.center-hub').removeClass('member');
        $('.center-hub').addClass('owner');		
    	console.log("submit_word, should be member, user = " + user);
		
        if (curWord.member.indexOf(letters[0])<0){
            err = 'You must use center character: ' + letters[0] + '.';
        }
        else if (matchWords.indexOf(curWord.member)<0){
            err = curWord.member + ' is not a valid word.'
        }

        if (err){
			console.log("submit_word, user==member, if err, err = " + err);			
            curWord.member = '';
            memberInputBox.val('');
            $('.role-panel').find('.active').removeClass('active');
//            return display_error(memberErrorElement, err);
            return display_error(onlyErrorElement, err);			
        }
        else {
            //memberListPan.append($('<div class="mt-5 pl-10 pr-10">').html(curWord.member));
            //memberListPan.scrollTop(10000);

            successWords.member.push(curWord.member);
            refresh_list_pan('member');

            score.member += (curWord.member.length * 10);
            index = matchWords.indexOf(curWord.member);
            curWord.member = '';
            memberInputBox.val('');
            $('.role-panel').find('.active').removeClass('active');
        }

	}

    matchWords.splice(index,1);
    refresh_views();
}

function enter_key(e, userRole){
    if (curUser != userRole)
        return e.preventDefault();

    if (e.keyCode == 13)
        return submit_word(userRole);

    var char = String.fromCharCode(e.keyCode).toUpperCase(),
        err = null;

    if (curUser == 'owner')
        curWord[curUser] = ownerInputBox.val();
    else
        curWord[curUser] = memberInputBox.val();

    if (letters.indexOf(char) == -1){
        err = 'No Matched Character'
    }
    else if (curWord[curUser].indexOf(char)>-1){
        err = 'Already Checked'
    }
	console.log("enter_key - curUser = " + curUser);
    if(err){
        if (curUser == 'owner')
            display_error(ownerErrorElement, err);
        else
            display_error(memberErrorElement, err);
    }
    else {
        click_letter(letters.indexOf(char), true);
/*
        if (gameMode == 'single')
            click_letter(letters.indexOf(char), true);
        else {
            curWord[curUser] += char;
            if (curUser == 'owner')
                ownerInputBox.val(curWord.owner);
            else
                memberInputBox.val(curWord[curUser]);
        }
*/
    }
    e.preventDefault();
}

function display_error(errElement, errMsg){
	console.log("display_error, top, errMsg = " + errMsg);
	console.dir (errElement);
    errElement.html(errMsg);
	
	console.dir (errElement);
	
    setTimeout(function(){
        errElement.html(' ');
    }, 10000)
}

function click_hint(){
	console.log("click_hint, top");
    if (gameMode == 'single'){
        if (!singleHintWord){
            singleHintWord = matchWords[Math.floor(Math.random() * matchWords.length)];
//            $('#hint-label').html(singleHintWord.substring(0, 1));
            $('#hint-block').html(singleHintWord.substring(0, 1));			
        }
        else {
			console.log("click_hint, single");			
//            var l = $('#hint-label').html().length;
            var l = $('#hint-block').html().length;			
       		console.log("click_hint, single, hint-block.html().length = " + l);
//		    $('#hint-label').html(singleHintWord.substring(0, l+1));
		    $('#hint-block').html(singleHintWord.substring(0, l+1));
            if (l == singleHintWord.length-1)
                singleHintWord = '';
        }

    }
    else {
		console.log("click_hint, not single");
        if (usedHint[curUser] >= 4)  {
//        	$('#hint-label').html("No more hints.");
        	$('#hint-block').html("No more hints.");			
		    return;
		}
        var hintWord = matchWords[Math.floor(Math.random() * matchWords.length)];

//        $('#hint-label').html(hintWord);
        $('#hint-block').html(hintWord);		
        usedHint[curUser] ++;
		
		if (curUser == "member") 
			document.getElementById("member-hints").innerHTML = usedHint[curUser];
		else
			document.getElementById("owner-hints").innerHTML = usedHint[curUser];		
		
		
		
		console.log("click_hint, else - curUser = " + curUser + ", usedHint[curUser] = " + usedHint[curUser]);
        $("input:checkbox").each(function(key){
            if ($(this).attr('data-index') <= usedHint[curUser] && $(this).attr('data-role') == curUser){
                $(this).prop('checked', true);
            }
        });
    }
}

function clear_word(userRole){
    curWord[userRole] = '';
    $('.role-panel').find('.active').removeClass('active');
    ownerInputBox.val('');
    memberInputBox.val('');
}

$(function(){
    $('#timer-check').checkboxpicker({
        onLabel: 'Enable Timer',
        offLabel: 'Disable Timer'
    });
});
