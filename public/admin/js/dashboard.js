(function($) {
    'use strict';
    $.fn.andSelf = function() {
        return this.addBack.apply(this, arguments);
    }
    $(function() {

        //check all boxes in order status 
        $("#check-all").click(function() {
            $(".form-check-input").prop('checked', $(this).prop('checked'));
        });

        if ($("#transaction-history").length) {
            const doughnutChartCanvas = document.getElementById('transaction-history');
            new Chart(doughnutChartCanvas, {
                type: 'doughnut',
                data: {
                    labels: ["No Review", "Like", "Dislike"],
                    datasets: [{
                        data: [chatHistory.no_feedback_percent, chatHistory.likes_percent, chatHistory.dislikes_percent],
                        backgroundColor: [
                            "#111111", "#00d25b", "#ffab00",
                        ],
                        borderColor: "#191c24"
                    }]
                },
                options: {
                    cutout: 70,
                    animationEasing: "easeOutBounce",
                    animateRotate: true,
                    animateScale: false,
                    responsive: true,
                    maintainAspectRatio: true,
                    showScale: false,
                    legend: false,
                    plugins: {
                        legend: {
                            display: false,
                        },
                    },
                },
            });
        }
    });
})(jQuery);