$(document).ready(function(){
	$.ajax({
        type: 'GET',
        url: '/all_records',
        mimeType: 'json',
        success: function(data) {
            $.each(data, function(i, data) {
                var body = "<tr>";
                //date / time / tech / clock (type) / site(location) / notes
                body    += "<td>" + data.id + "</td>";
                body    += "<td>" + data.date + "</td>";
                body    += "<td>" + data.time + "</td>";
                body    += "<td>" + data.tech + "</td>";
                body    += "<td>" + data.type + "</td>";
                body    += "<td>" + data.location + "</td>";
                if(data.notes==''){
                    body    += "<td>" 
                    +"<a href=\"#\"> <button class=\"btn btn-primary\" type=\"button\">View</button></a>"
                    + "</td>";
                }else{
                    body    += "<td>" + "" + "</td>";
                }
                body    += "</tr>";
                $( body ).appendTo( $( "tbody" ) );
            });
            $('#dataset').DataTable({
                    "Date": [[ 0, "desc" ]]
			    });
        },
        error: function() {
            alert('Fail!');
        }
	});
});