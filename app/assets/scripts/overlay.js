"use strict";
$(function () {
	let trivia = $(".trivia");
	let correct = $(".correct");
	let noAnswer = $(".no-answer");

	let channel = trivia.data('channel');
	let pollInterval = parseInt(trivia.data('poll') || "5000", 0);
	let questionTimer = parseInt(trivia.data('time') || "30000", 0);


	let currentCountdown = 0;
	let progressIntervalId;

	let currentQuestion = null;
	let outOfTime = false;

	let clearTrivia = () => {
		noAnswer.addClass("hidden");
		correct.addClass("hidden");
		trivia.addClass("hidden");

		let q = $(".question", trivia);
		q.empty();
		let c = $(".category", trivia);
		c.empty();
		let a = $(".answers", trivia);
		a.empty();

		let who = $(".who", correct);
		who.empty();

		let na = $(".answer", noAnswer);
		na.empty();
	};

	let stopAnswerTimer = () => {
		if (!progressIntervalId) {
			console.log("not running");
			return;
		}

		clearInterval(progressIntervalId);
		currentCountdown = 0;
		progressIntervalId = null;
	};

	let showNoAnswerGiven = () => {
		correct.addClass("hidden");
		trivia.addClass("hidden");

		if (currentQuestion === null) {
			return;
		}
		currentCountdown = 0;
		noAnswer.removeClass("hidden");
		let na = $(".answer", noAnswer);
		na.html(currentQuestion.answers[currentQuestion.correctAnswer]);
		startCorrectClearTimer();
	};

	let startCorrectClearTimer = () => {
		setTimeout(() => {
			clearCurrentQuestion();
			currentCountdown = 0;
			outOfTime = false;
		}, 15 * 1000);
	};

	let clearCurrentQuestion = () => {
		if (currentQuestion === null) {
			return;
		}
		// clear question
		console.log("clear question");
		$.ajax(`/api/trivia/clear/${channel}`, {
			success: (data, text, xhr) => {
				correct.addClass("hidden");
				trivia.addClass("hidden");
				noAnswer.addClass("hidden");
				currentQuestion = null;
				currentCountdown = 0;
				outOfTime = false;
				stopAnswerTimer();
				console.log("successfully cleared question.");
			}
		});
	};

	let startAnswerTimer = () => {
		console.log(progressIntervalId);
		if (progressIntervalId != null || currentQuestion === null) {
			console.log("already running");
			return;
		}

		outOfTime = false;
		currentCountdown = 0;

		// count down timer to hide and reset the question.
		progressIntervalId = setInterval(function () {
			let bar = $(".bar", trivia);
			if (currentCountdown >= questionTimer) {
				outOfTime = true;
				bar.css("width", '0%');
				// $(".bar", trivia).animate({
				// 	width: 0
				// }, 200, "linear");
				if (currentQuestion != null) {
					showNoAnswerGiven();
				}
				// clearCurrentQuestion();
				// exit
				return;
			}

			let percentage = Math.floor((currentCountdown / questionTimer) * 100);
			let remaining = 100 - percentage;
			if (remaining >= 66) {
				bar.removeClass("hurry").removeClass("warn").addClass("good");
			} else if (remaining >= 33) {
				bar.removeClass("hurry").removeClass("good").addClass("warn");
			} else {
				bar.removeClass("warn").removeClass("good").addClass("hurry");
			}
			$(".bar", trivia).css("width", `${100 - percentage}%`);
			// $(".bar", trivia).animate({
			// 	width: `${100 - percentage}%`
			// }, 200, "linear", () => {
			// 	console.log("animate complete")
			// 	// completed animation
			// });

			currentCountdown += 100;
		}, 100);
	};

	setInterval(function () {
		$.ajax(`/api/trivia/${channel}`, {
			success: (data, text, xhr) => {

				if (data === null) {
					clearTrivia();
					return;
				}

				currentQuestion = data;

				if (!outOfTime) {
					if (currentQuestion.correctGuess) {
						console.log("correct guess");
						stopAnswerTimer();

						// someone got it right
						trivia.addClass("hidden");
						let who = $(".who", correct);
						let answer = $(".answer", correct);

						who.html(currentQuestion.correctGuess);
						answer.html(currentQuestion.answers[currentQuestion.correctAnswer]);

						correct.removeClass("hidden");

						startCorrectClearTimer();

						// timer to remove and reset
					} else {
						correct.addClass("hidden");
						console.log(currentQuestion);
						// no correct guess yet
						let q = $(".question", trivia);
						q.html(currentQuestion.question);
						let c = $(".category", trivia);
						c.html(currentQuestion.category);

						let a = $(".answers", trivia);
						a.empty();
						for (let x = 0; x < currentQuestion.answers.length; ++x) {
							a.append(`<li>${currentQuestion.answers[x]}</li>`);
						}
						trivia.removeClass("hidden");
						startAnswerTimer();
					}
				} else {
					console.log("outta time");
					correct.addClass("hidden");
					trivia.addClass("hidden");
				}

			}
		});
	}, pollInterval);


});
