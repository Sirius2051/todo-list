

document.addEventListener('DOMContentLoaded', () => {
    const cardContainer = document.getElementById('cardContainer');
    function createCard(data) {
        const card = document.createElement('div');
        card.className = 'overflow-y-auto w-[22%] mx-auto';
        card.innerHTML = `
              <div class="p-4 text-center sm:items-center sm:p-0">
                <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
                    <div class="sm:flex sm:items-start">
                      
                      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">${data.title}</h3>
                      <span class="text-sm text-gray-500">${data.date}</span>
                        <div class="mt-2">
                          <p class="text-sm text-gray-500">${data.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button type="button" class="inline-flex w-full justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 sm:ml-3 sm:w-auto openModal" value="${data._id}">Editar</button>
                    <button type="button" class="mt-3 inline-flex w-full justify-center rounded-md bg-green px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-red-500 sm:mt-0 sm:w-auto deleteButton" value="${data._id}">Eliminar</button>
                  </div>
                </div>
              </div>
        `;
        return card;
    }
    async function fetchAndDisplayCards() {
        try {
            const response = await fetch('http://localhost:3000/api/get/task');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            cardContainer.innerHTML = "";
            data.forEach(item => {
                const card = createCard(item);
                cardContainer.appendChild(card);
                setButtons(data);
            });
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }
    fetchAndDisplayCards();
    async function saveTask(event) {
      event.preventDefault();
      var taskId = document.getElementsByClassName("_id")[0];
      var taskName = document.getElementsByClassName("nameInput")[0];
      var taskDescription = document.getElementsByClassName("descriptionInput")[0];
      var taskDate = document.getElementsByClassName("dateInput")[0];

      try {
        if (taskId.value == "") {
          var response = await fetch('/api/create/task', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId: 1, title: taskName.value, description: taskDescription.value, date: taskDate.value, status: 0 })
          });
        } else {
          var response = await fetch(`/api/update/task/${taskId.value}`, {
              method: 'PUT',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ userId: 1, title: taskName.value, description: taskDescription.value, date: taskDate.value, status: 0 })
        });
        }

          if (response.ok) {
              taskName.value = '';
              taskDescription.value = '';
              taskDate.value = '';
              const modal = document.getElementById('modal').classList.add('hidden');
        const modalOverlay = document.getElementById('modalOverlay').classList.add('hidden');
              fetchAndDisplayCards();
          } else {
              console.error('Error creating task:', response.statusText);
          }
      } catch (error) {
          console.error('Error creating task:', error);
      }
    }
    async function deleteTask(taskId) {
      try {
          const response = await fetch(`/api/delete/task/${taskId}`, {
              method: 'DELETE'
          });

          if (response.ok) {
            fetchAndDisplayCards();
          } else {
              console.error('Error deleting task:', response.statusText);
          }
      } catch (error) {
          console.error('Error deleting task:', error);
      }
  }


    function setButtons(data) {
        const openModalButtons = document.getElementsByClassName('openModal');
        const deleteButtons = document.getElementsByClassName('deleteButton');
        const closeModalButton = document.getElementById('closeModal');
        const modal = document.getElementById('modal');
        const modalOverlay = document.getElementById('modalOverlay');
        const openModalButton = document.getElementById('openModal');
        
        for (var i=0; i< openModalButtons.length; i++) {
            openModalButtons[i].addEventListener("click", (e) => {
               modal.classList.remove('hidden');
               modalOverlay.classList.remove('hidden');
               var taskdata = data.find(item => item._id == e.target.value);
               modal.getElementsByClassName("_id")[0].value = taskdata._id
               modal.getElementsByClassName("nameInput")[0].value = taskdata.title
               modal.getElementsByClassName("descriptionInput")[0].value = taskdata.description
               modal.getElementsByClassName("dateInput")[0].value = taskdata.date
            });
        }
        for (var i=0; i< deleteButtons.length; i++) {
          deleteButtons[i].addEventListener("click", (e) => {
             deleteTask(e.target.value);
          });
        }
        openModalButton.addEventListener("click", () => {
            modal.getElementsByClassName("_id")[0].value = ""
            modal.getElementsByClassName("nameInput")[0].value = ""
            modal.getElementsByClassName("descriptionInput")[0].value = ""
            modal.getElementsByClassName("dateInput")[0].value = ""
            modal.classList.remove('hidden');
            modalOverlay.classList.remove('hidden');
        });
        closeModalButton.addEventListener('click', () => {
            modal.classList.add('hidden');
            modalOverlay.classList.add('hidden');
        });
        document.getElementById('saveButton').addEventListener('click', saveTask);
    }

});
