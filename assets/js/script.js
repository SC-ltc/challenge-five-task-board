// Retrieve tasks and nextId from localStorage
let taskList = JSON.parse(localStorage.getItem("tasks"));
//let nextId = JSON.parse(localStorage.getItem("nextId"));

// Referenced Module 5, activity 28 for many of the to-dos

// Grab references to the modal and the input fields 
const taskDisplayEl = $('#task-display');
const taskNameInputEl = $('#task-name-input');
const taskDescInputEl = $('#task-desc-input');
const taskDateInputEl = $('#taskDueDate');
const modalForm = $('#formModal');

// Reads tasks from local storage and returns array of task objects.
// If there are no tasks in localStorage, it initializes an empty array ([]) and returns it.
function readTasksFromStorage() {
  // Retrieve tasks from localStorage and parse the JSON to an array.
  // We use `let` here because there is a chance that there are no tasks in localStorage (which means the tasks variable will be equal to `null`) and we will need it to be initialized to an empty array.
  let tasks = JSON.parse(localStorage.getItem('tasks'));

  // If no tasks were retrieved from localStorage, assign tasks to a new empty array to push to later.
  if (!tasks) {
    tasks = [];
  }

  // Return the tasks array either empty or with data in it whichever it was determined to be by the logic right above.
  return tasks;
}

// Accepts an array of tasks, stringifys them, and saves them in localStorage.
function saveTasksToStorage(tasks) {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// Todo: create a function to generate a unique task id
// Assisted by Xpert Learning Assistant
function generateTaskId() {
    // Get the current timestamp
    const timestamp = new Date().getTime();
    
    // Generate a random number
    const randomNum = Math.floor(Math.random() * 1000);
    
    // Combine them to create a unique ID
    const taskId = `task-${timestamp}-${randomNum}`;
    
    return taskId;
}

// Todo: create a function to create a task card
function createTaskCard(task) {
    const taskCard = $('<div>')
    .addClass('card project-card draggable my-3')
    .attr('data-taskid', task.taskId);
  const cardHeader = $('<div>').addClass('card-header h4').text(task.name);
  const cardBody = $('<div>').addClass('card-body');
  const cardDescription = $('<p>').addClass('card-text').text(task.description);
  const cardDueDate = $('<p>').addClass('card-text').text(task.dueDate);
  const cardDeleteBtn = $('<button>')
    .addClass('btn btn-danger delete')
    .text('Delete')
    .attr('data-taskid', task.taskId);
  cardDeleteBtn.on('click', handleDeleteTask);

  // Sets the card background color based on due date. Only apply the styles if the dueDate exists and the status is not done.
  if (task.status !== 'done') {
    const now = dayjs();
    const taskDueDate = dayjs(task.dueDate);

    // If the task is due today, make the card yellow. If it is overdue, make it red.
    if (now.isSame(taskDueDate, 'day')) {
      taskCard.addClass('bg-warning text-white');
    } else if (now.isAfter(taskDueDate)) {
      taskCard.addClass('bg-danger text-white');
      cardDeleteBtn.addClass('border-light');
    }
  }

  // Gather all the elements created above and append them to the correct elements.
  cardBody.append(cardDescription, cardDueDate, cardDeleteBtn);
  taskCard.append(cardHeader, cardBody);

  // Return the card so it can be appended to the correct lane.
  return taskCard;

}

// Todo: create a function to render the task list and make cards draggable
function renderTaskList() {

  const tasks = readTasksFromStorage();

  // Empty existing project cards out of the lanes
  const todoList = $('#todo-cards');
  todoList.empty();

  const inProgressList = $('#in-progress-cards');
  inProgressList.empty();

  const doneList = $('#done-cards');
  doneList.empty();

  // Loop through projects and create project cards for each status
  for (let task of tasks) {
    if (task.status === 'to-do') {
      todoList.append(createTaskCard(task));
    } else if (task.status === 'in-progress') {
      inProgressList.append(createTaskCard(task));
    } else if (task.status === 'done') {
      doneList.append(createTaskCard(task));
    }
  }

  // Use JQuery UI to make task cards draggable
  $('.draggable').draggable({
    opacity: 0.7,
    zIndex: 100,
    // This is the function that creates the clone of the card that is dragged. This is purely visual and does not affect the data.
    helper: function (e) {
      // Check if the target of the drag event is the card itself or a child element. If it is the card itself, clone it, otherwise find the parent card  that is draggable and clone that.
      const original = $(e.target).hasClass('ui-draggable')
        ? $(e.target)
        : $(e.target).closest('.ui-draggable');
      // Return the clone with the width set to the width of the original card. This is so the clone does not take up the entire width of the lane. This is to also fix a visual bug where the card shrinks as it's dragged to the right.
      return original.clone().css({
        width: original.outerWidth(),
      });
    },
  });

}

// Todo: create a function to handle adding a new task
function handleAddTask(event){
  
  event.preventDefault();

  // Read user input from the modal form
  const taskName = taskNameInputEl.val().trim();
  const taskDesc = taskDescInputEl.val();
  const taskDate = taskDateInputEl.val();

  const newTask = {
    taskId: generateTaskId(),
    name: taskName,
    description: taskDesc,
    dueDate: taskDate,
    status: 'to-do',
  };

  // Pull the tasks from localStorage and push the new project to the array
  const tasks = readTasksFromStorage();
  tasks.push(newTask);

  // Save the updated tasks array to localStorage
  saveTasksToStorage(tasks);

  // Print task data back to the screen
  renderTaskList();

  // Clear the form inputs
  taskNameInputEl.val('');
  taskDescInputEl.val('');
  taskDateInputEl.val('');
}

// Todo: create a function to handle deleting a task
function handleDeleteTask(event){
  const taskId = $(this).attr('data-taskid');
  const tasks = readTasksFromStorage();

  // Remove the selected task from the array.
  tasks.forEach((task) => {
    if (task.taskId === taskId) {
      tasks.splice(tasks.indexOf(task), 1);
    }
  });

  // Use helper function to save the updated task list to localStorage
  saveTasksToStorage(tasks);

  // Print the tasks back to the screen
  renderTaskList();

}

// Todo: create a function to handle dropping a task into a new status lane
function handleDrop(event, ui) {
    
    const tasks = readTasksFromStorage();
  
    // Get the taskID from the event
    let laneId = ui.draggable.data('taskid');
   
    // Get the ID of the lane that the card was dropped into
    const laneStatus = event.target.id;
  
    // Update task statuses based on lanes
    for (let task of tasks) {
      if (task.taskId === laneId) {
        task.status = laneStatus;     
      }    
    }
  
    // Save the updated array to local storage
    localStorage.setItem("tasks", JSON.stringify(tasks));
    renderTaskList();

}

// Todo: when the page loads, render the task list, add event listeners, make lanes droppable, and make the due date field a date picker
$(document).ready(function () {
  renderTaskList();

  // Event listener to close the modal
  $(".close").on("click", function () {
    modalForm.modal("hide");
  });

  // event listener to add task to lane
  modalForm.on("click", ".submit", handleAddTask);

  // event listener to close modal dialog after submission
  $(".submit").on("click", function () {
    modalForm.modal("hide");
  });

  taskDisplayEl.on("click", ".delete", handleDeleteTask);

  // Make the lanes droppable
  $(".lane").droppable({
    accept: ".ui-draggable",
    drop: handleDrop,
  });

  // Make the date field a date picker
  taskDateInputEl.datepicker({
    changeMonth: true,
    changeYear: true,
  });
});
