(function ($) {
  'use strict';
  $(function () {
    var todoListItem = $('.todo-list');
    var todoListInput = $('.todo-list-input');

    // Add task
    $('.todo-list-add-btn').on("click", function (event) {
      event.preventDefault();

      var item = todoListInput.val();

      if (item) {
        $.ajax({
          url: '/api/todo/add-todo',
          method: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ content: item }),
          success: function (response) {
            // Assuming response contains the inserted task with ID
            todoListItem.append(`
                <li data-id="${response.id}">
                  <div class='form-check'>
                    <label class='form-check-label'>
                      <input class='checkbox' type='checkbox'/>
                      ${response.content}
                      <i class='input-helper'></i>
                    </label>
                  </div>
                  <i class='remove mdi mdi-close-box'></i>
                </li>
              `);
            todoListInput.val('');
          },
          error: function (err) {
            console.error('Add failed:', err);
          }
        });
      }
    });

    // Toggle complete
    todoListItem.on('change', '.checkbox', function () {
      var listItem = $(this).closest('li');
      var todoId = listItem.data('id');
      var completed = $(this).is(':checked');

      $.ajax({
        url: `/api/todo/update-todo/${todoId}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify({ completed: completed }),
        success: function () {
          listItem.toggleClass('completed');
        },
        error: function (err) {
          console.error('Update failed:', err);
        }
      });
    });

    // Remove task
    todoListItem.on('click', '.remove', function () {
      var listItem = $(this).closest('li');
      var todoId = listItem.data('id');

      $.ajax({
        url: `/api/todo/delete-todo/${todoId}`,
        method: 'DELETE',
        success: function () {
          listItem.remove();
        },
        error: function (err) {
          console.error('Delete failed:', err);
        }
      });
    });
  });

  // Load todos on page load
  function loadTodos() {
    $.ajax({
      url: '/api/todo/get-todos',
      method: 'GET',
      success: function (todos) {
        $('.todo-list').empty(); // Clear list before adding
        todos.forEach(todo => {
          $('.todo-list').append(`
          <li data-id="${todo.id}" class="${todo.completed ? 'completed' : ''}">
            <div class='form-check'>
              <label class='form-check-label'>
                <input class='checkbox' type='checkbox' ${todo.completed ? 'checked' : ''} />
                ${todo.content}
                <i class='input-helper'></i>
              </label>
            </div>
            <i class='remove mdi mdi-close-box'></i>
          </li>
        `);
        });
      },
      error: function (err) {
        console.error('Failed to load todos:', err);
      }
    });
  }

  document.addEventListener('DOMContentLoaded', loadTodos);

})(jQuery);
