// 데이터베이스 생성 및 열기
function openDB(){
   db = window.openDatabase('maskDB', '1.0', '마스크DB', 1024*1024); 
   // console.log('1_DB 생성...'); 
} 

// 테이블 생성 트랜잭션 실행
function createTable() {
   db.transaction(function(tr){
      var sql_search_log = 'create table if not exists search_logs(id integer primary key autoincrement, name varchar(50))';       
      var sql_fav_pharmacies = 'create table if not exists fav_pharmacies(id integer primary key autoincrement, code integer not null, name varchar(50), addr varchar(50), lat real, lng real, remain_stat text, memo text)';
      var sql_system_vars = 'create table if not exists system_vars(id integer primary key autoincrement, name varchar(50), value varchar(50))';
      
      tr.executeSql(sql_search_log, [], function(){
         // console.log('search_log created...');        
      }, function(){
         console.log('Failed to create search_logs...');            
      });

      tr.executeSql(sql_fav_pharmacies, [], function(){
         // console.log('fav_pharmacies created...');        
      }, function(){
         console.log('Failed to create fav_pharmacies...');            
      });
      
      tr.executeSql(sql_system_vars, [], function(){
         // console.log('system_vars created...');        
      }, function(){
         console.log('Failed to create system_vars...');            
      });

      reset_system_vars('is_saved', 'false');
   });
} 

// delete all location search logs
function purch_all(){ 
   db.transaction(function(tr){
      var name = $('#searchQuery').val();
       
      var sql1 = 'delete from search_logs';      
      var sql2 = 'delete from fav_pharmacies';      
      var sql3 = 'delete from system_vars';      
      tr.executeSql(sql1, [], function(tr, rs){    
            // console.log('deleted search logs');    
      });
      tr.executeSql(sql2, [], function(tr, rs){    
         // console.log('deleted fav_pharmacies');    
      });
      tr.executeSql(sql3, [], function(tr, rs){    
         // console.log('deleted system_vars');    
      });
   });      
}

// insert location search log
function insert_search_logs(){ 
   db.transaction(function(tr){
      var name = $('#searchQuery').val();
       
      var sql = 'insert into search_logs(name) values(?)';      
      tr.executeSql(sql, [name], function(tr, rs){    
         // console.log('search log inserted...no: ' + rs.insertId);    
      });
   });      
}

// delete fav_pharmacies
function delete_fav_pharmacies(phar){ 
   db.transaction(function(tr){
      var code = phar.code;
      
      var sql = 'delete from fav_pharmacies where code = ?';

      tr.executeSql(sql, [code], function(tr, rs){    
         // console.log(rs);
      }, function(){
         alert('failed to delete fav pharmacy');           
      });
   });      
}

// insert fav_pharmacies
function insert_fav_pharmacies(phar){ 
   db.transaction(function(tr){
      // console.log(phar);
      var code = phar.code;
      var name = phar.name;
      var addr = phar.addr;
      var lat = phar.lat;
      var lng = phar.lng;
      var remain_stat = phar.remain_stat;
      var memo = phar.memo;
      
      var sql = 'insert into fav_pharmacies(code, name, addr, lat, lng, remain_stat, memo) values(?, ?, ?, ?, ?, ?, ?)';

      tr.executeSql(sql, [code, name, addr, lat, lng, remain_stat, memo], function(tr, rs){    
         // console.log('fav pharmacies inserted...no: ' + rs.insertId);
      }, function(){
         alert('failed to insert pharmacy');           
      });
   });      
}

// update fav_pharmacies
function update_fav_pharmacies(phar){ 
   db.transaction(function(tr){
      // var id = phar.id;
      var code = phar.code;
      var name = phar.name;
      var addr = phar.addr;
      var lat = phar.lat;
      var lng = phar.lng;
      var remain_stat = phar.remain_stat;
      var memo = phar.memo;
      
      var sql = 'update fav_pharmacies set name = ?, addr = ?, lat = ?, lng = ?, remain_stat = ?, memo = ? where code = ?';

      tr.executeSql(sql, [name, addr, lat, lng, remain_stat, memo, code], function(tr, rs){    
         // console.log(rs)
      }, function(){
         alert('failed to insert pharmacy');           
      });
   });      
}

// list fav_pharmacies
function list_fav_pharmacies(){ 
  
   // force to close previous modal before opening list fav pharmacies modal
   // console.log($('#phar_info_modal').length);
   if ($('#phar_info_modal').length > 0) {
      $('#phar_info_modal')[0].hidden = true;
   }

   db.transaction(function(tr){
      var sql = 'select * from fav_pharmacies';

      tr.executeSql(sql, [], function(tr, rs){  
         var list_html = $('#list_html').val();
         // form1.reset();  
         count = rs.rows.length;
         if (count > 0) {
            // to pass object parameters to 'delete_phar_on_modal()' function 
            this.phar_arr = rs.rows; 
            var self = this;  	

            list_html = '<br><div>저장된 약국 Total: <b>'+ count +'</b><br><br>';				
            for ( i = 0; i < count; i++ ) 
            {		
               list_html += '<hr/>' + rs.rows[i].name + '<span style="margin-top:-6px !important;float:right;color:red;font-size:20px" onclick={delete_phar_index_on_modal('+i+')}><i class="fa fa-trash-o" aria-hidden="true"></i></span><br>'; 
               list_html += rs.rows[i].addr + '<br>'; 
               list_html += '<span style="margin-top:10px !important;color:#000">' + rs.rows[i].memo + '</span><br>'; 
               list_html += rs.rows[i].remain_stat + '<br>'; 
               list_html += '</div>';					
            }	
            $('#list_html').html(list_html);
         } else {
            list_html = '<br><div>저장된 약국 없음<br><br></br>';
            $('#list_html').html(list_html);
         }
      }, function(){
         alert('failed to insert pharmacy');           
      });
   });      
}

// this function is to delete saved pharmacy from list_fav_phar
function delete_phar_index_on_modal(index){
   // console.log(index);
   // console.log(self.phar_arr[index]);
   delete_fav_pharmacies(self.phar_arr[index]);
   // retrieve list of fav pharmacies
   list_fav_pharmacies();
}

// retrieve fav_pharmacy to delete or insert
function retrieve_fav_pharmacies_modal(phar, purpose, search_pharmacy){ 
   db.transaction(function(tr){
      // console.log(phar)

      var code = phar.code;
      var sql = 'select * from fav_pharmacies where code = ?';

      tr.executeSql(sql, [code], function(tr, rs){    
         // if the phar exists already,
         // retrieve or delete, else insert
         let temp_memo = '';
         if (purpose == 'thumup') {
            if (rs.rows.length > 0) {
               // delete
               // to reset textarea
               // $('#phar_memo').val(' ');
               delete_fav_pharmacies(phar);// 북마크된 애를 취소 
            } else {
               // insert new fav pharmacy
               insert_fav_pharmacies(phar); //북마크 추가
            }
            // closeModal();
            retrieve_fav_pharmacies_modal(phar, 'retrieve', ''); //??????????
         } else { // 북마크된 약국일 때
            if (rs.rows.length > 0) {
               // retrieve
               // to display
               temp_memo = rs.rows.item(0).memo;
               // console.log(rs.rows.item(0).memo);
               // to update DB
               $('#phar_memo').val(rs.rows.item(0).memo);
            } 
         } //purpose for retrieve

         let is_saved = false;
         if (rs.rows.length > 0) {
            is_saved = true;
         } 
         let content_changed;
         
         // to pass object parameter to 'add_fav_phar()' function 
         this.phar = phar; 
         var self = this; // 전역변수로 웹안에서 다 불러올수있음 

         if ( !is_saved ) { 
            // modal
            content_changed = '<div id="phar_info_modal"  tabindex="-1" role="dialog" >' +
            '<div class="modal-dialog" role="document">' +
               '<div class="modal-content">' +
               '<div class="modal-header">' +
                  ' <h5 class="modal-title">' + phar.name +'<div onclick={add_fav_phar()} style="float:right;margin-left:10px;"><i class="fa fa-bookmark-o fa-2x" style="color:#8b929e" aria-hidden="true"></i></div></h5>' +
               '</div>' +
               '<div class="modal-body">' +
               '        <div> ' + phar.addr + '</div><br>' +
               '        <div> ' + phar.remain_stat + '</div><br>' +
               '                <div><a href="https://map.kakao.com/?q=' + search_pharmacy + '" target="_blank" class="link">카카오맵으로 보기</a></div>' + 
               '</div>' +
               '<div class="modal-footer">' +
                  '<button type="button" class="btn btn-secondary" onclick="closeModal()">닫기</button>' +
               '</div>' +
               "</div>" +
            '</div>' +
            '</div>';
         } else {
            // modal
            content_changed = '<div id="phar_info_modal" tabindex="-1" role="dialog" >' +
            '<div class="modal-dialog" role="document">' +
               '<div class="modal-content">' +
               '<div class="modal-header">' +
                  ' <h5 class="modal-title">' + phar.name +'<div onclick="add_fav_phar()" style="float:right;"><i class="fa fa-bookmark fa-2x" style="color:#4287f5;margin-left:10px;" aria-hidden="true"></i></div></h5>' +
               '</div>' +
               '<div class="modal-body">' +
               '        <div> ' + phar.addr + '</div><br>' +
               '        <div> ' + phar.remain_stat + '</div><br>' +
               '                <textarea style="width:100%;" cols="auto" rows="5" name="phar_memo" id="phar_memo" data-mini="true">' + temp_memo + '</textarea>	' + 
               // '                <textarea style="width:100%;" cols="auto" rows="5" name="phar_memo" id="phar_memo" data-mini="true">' + rs.rows.item(0).memo + '</textarea>	' + 
               '                <div><a href="https://map.kakao.com/?q=' + search_pharmacy + '" target="_blank" class="link">카카오맵으로 보기</a></div>' + 
               '</div>' +
               '<div class="modal-footer">' +
                  '<button type="button" class="btn btn-secondary" onclick="closeModal()">닫기</button>' +
               '<button type="button" class="btn btn-primary" onclick={change_phar_memo()}>저장</button>' +
               '</div>' +
               "</div>" +
            '</div>' +
            '</div>';
         }
         
         $('#phar_info_modal_test').html(content_changed);

      }, function(){
         alert('failed to insert pharmacy');           
      });

   });      
}

function change_phar_memo(event) {
   self.phar.memo = $('#phar_memo').val();
   update_fav_pharmacies(self.phar);
   closeModal();
   // console.log(phar.memo);
}

function add_fav_phar(event) { 
   // Get worldText from the option passed into this tag from the parent: 
   // Or get worldText from the tag's current state 
   retrieve_fav_pharmacies_modal(self.phar, 'thumup', '');
} 

function closeModal(){//
   // hidden undifined
   if($('#phar_info_modal')[0].hidden != undefined) {
      let is_hidden = $('#phar_info_modal')[0].hidden;
      if (is_hidden) {
         $('#phar_info_modal')[0].hidden = false;
      } else {
         $('#phar_info_modal')[0].hidden = true;
      }
   }
}

// insert system_vars
function reset_system_vars(name, value){ //안씀
   db.transaction(function(tr){
      // delete all system_vars
      var sql = 'delete from system_vars';
         tr.executeSql(sql, [], function(tr, rs){ 
      });

      sql = 'insert into system_vars(name, value) values(?, ?)';

      tr.executeSql(sql, [name, value], function(tr, rs){    
         // console.log('system_vars inserted...no: ' + rs.insertId);
      }, function(){
         alert('failed to insert system varaible');           
      });
   });      
}