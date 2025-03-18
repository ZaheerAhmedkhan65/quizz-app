if(quizData.length == 0 ){
    document.body.innerHTML = "";
    document.body.classList.add("d-flex","align-items-center","justify-content-center","vh-100");
    document.body.innerHTML = `
    <div class="border border-2 border-dark" style="height: 50vh;">
        <div class="p-2">
            <h1 class="text-center">No questions found for this quiz.</h1>
            <p class="text-center">Please create some questions first and try again.</p>
        </div>
        <div class="d-flex justify-content-center">
            <a href="/api/courses/${courseId}/quizzes/${quizzId}" class="btn btn-primary">Go Back</a>
        </div>
    </div>
    `;
    // window.location.href = "/api/courses/"+courseId+"/quizzes/"+quizzId;
}else if(quizz.quizz_progress == 100){
    document.body.innerHTML = "";
    document.body.classList.add("d-flex","align-items-center","justify-content-center","vh-100");
    document.body.innerHTML = `
    <div class="border border-2 border-dark" style="height: 50vh;">
        <div class="p-2">
            <h1 class="text-center">You have already completed this quizz.</h1>
            <p class="text-center">Please try another quizz.</p>
        </div>
        <div class="d-flex justify-content-center">
            <a href="/api/courses/${courseId}/quizzes/${quizzId}" class="btn btn-primary">Go Back</a>
        </div>
    </div>
    `;
}