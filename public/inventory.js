document.addEventListener('DOMContentLoaded', function () {
    const db = firebase.firestore();

    function loadinventory() {
        const db = firebase.firestore();
        const inventoryDataTable = document.getElementById('inventoryData');
        const itemSelect = document.getElementById('itemSelect');
        const deleteItemSelect = document.getElementById('deleteItemSelect');
    
        // 清空表格和下拉菜单
        while (inventoryDataTable.rows.length > 0) {
            inventoryDataTable.deleteRow(0);
        }
        itemSelect.innerHTML = '';
        deleteItemSelect.innerHTML = '';
        console.log("Cleared old inventory data.");
    
        // 从Firebase获取数据
        db.collection("Mango").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                // 插入新的表格行
                const row = inventoryDataTable.insertRow(-1);
                const cell1 = row.insertCell(0);
                const cell2 = row.insertCell(1);
                cell1.textContent = doc.id;
                cell2.textContent = doc.data().Quantity;
    
                // 更新选择用于更新的下拉菜单
                const updateOption = document.createElement('option');
                updateOption.value = doc.id;
                updateOption.textContent = doc.id;
                itemSelect.appendChild(updateOption);
    
                // 更新选择用于删除的下拉菜单
                const deleteOption = document.createElement('option');
                deleteOption.value = doc.id;
                deleteOption.textContent = doc.id;
                deleteItemSelect.appendChild(deleteOption);
            });
        }).catch((error) => {
            console.log("Error getting documents: ", error);
        });
    }
    
    loadinventory();

    function updateItem() {
        console.log("Updating item...");
        const selectedItem = document.getElementById('itemSelect').value;
        const newQuantity = document.getElementById('updateQuantity').value;
    
        if (newQuantity === '') {
            alert('Please enter a quantity.');
            return;
        }
    
        const db = firebase.firestore();
        db.collection("Mango").doc(selectedItem).update({
            Quantity: newQuantity
        })
        .then(() => {
            console.log("Document successfully updated!");
            alert('Item updated successfully!');
            // loadinventory();  // 此行已被移除，不再刷新表格
        })
        .catch((error) => {
            console.error("Error updating document: ", error);
            alert('Error updating item.');
        });
        loadinventory();
    }
    
    function clearTable() {
        console.log("Clearing table...");
        const inventoryDataTable = document.getElementById('inventoryData');
        // 確保從第一行開始刪除，保留表頭
        while (inventoryDataTable.rows.length > 0) {
            inventoryDataTable.deleteRow(0);
        }
    }
    function addNewItem() {
        const itemName = document.getElementById('newItemName').value;
        const itemQuantity = document.getElementById('newItemQuantity').value;
    
        if (!itemName || itemQuantity === '') {
            alert('Please fill out both fields.');
            return;
        }
    
        const db = firebase.firestore();
        db.collection("Mango").doc(itemName).set({
            Quantity: itemQuantity
        })
        .then(() => {
            console.log("Document successfully written!");
            alert('New item added successfully!');
            // 可選：重新加載資料或更新頁面元素來顯示新添加的項目
            loadinventory();  // 如果你想要即時更新表格，可以調用這個函數
        })
    }

    function deleteSelectedItem() {
        const selectedItem = document.getElementById('deleteItemSelect').value;
        console.log("Attempting to delete item with ID: ", selectedItem); // 添加这行代码来检查获取的 ID 是否正确
        const confirmDelete = confirm("Are you sure you want to delete this item: " + selectedItem + "?");
        if (confirmDelete) {
            const db = firebase.firestore();
            db.collection("Mango").doc(selectedItem).delete().then(() => {
                console.log("Document successfully deleted!");
                alert('Item deleted successfully!');
                loadinventory(); // 刷新库存列表来反映删除的变化
            }).catch((error) => {
                console.error("Error removing document: ", error);
                alert('Error deleting item.');
            });
        } else {
            console.log("Delete action canceled.");
        }
    }

    window.updateItem = updateItem; // 確保updateItem函數在全局範圍內可訪問
    window.clearTable = clearTable;
    window.loadinventory = loadinventory;
    window.addNewItem = addNewItem;
    window.deleteSelectedItem = deleteSelectedItem;
});

function searchItems() {
    var input = document.getElementById('searchBox').value.toUpperCase();
    var inventoryTable = document.getElementById('inventoryData');
    var tr = inventoryTable.getElementsByTagName('tr');

    // 循环表格每一行，查找匹配项
    for (var i = 0; i < tr.length; i++) {
        var td = tr[i].getElementsByTagName('td')[0];
        if (td) {
            var textValue = td.textContent || td.innerText;
            if (textValue.toUpperCase().indexOf(input) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }       
    }
}