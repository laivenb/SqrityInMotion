$(document).ready(function () {
    $('#portTable').DataTable({
        "pagingType": "simple_numbers",  // Pagination style
        "searching": true,               // Enable search/filter
        "ordering": true,                // Enable sorting
        "order": [[0, "asc"]]            // Initial sorting (optional)
    });
});
