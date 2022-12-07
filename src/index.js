// Import our custom CSS
// import './scss/style.scss';

// general
import 'bootstrap/dist/css/bootstrap.min.css';

// select2-plugin
import 'select2/dist/css/select2.min.css';
import 'select2-bootstrap-theme/dist/select2-bootstrap.min.css';
import 'select2';

// datetimepicker-plugin
import 'bootstrap-datetimepicker-npm/build/css/bootstrap-datetimepicker.min.css';
import DateTimePicker from 'bootstrap-datetimepicker-npm/src/js/bootstrap-datetimepicker';
(DateTimePicker($));

// timepicker plugin
import 'timepicker/jquery.timepicker.min.css';
import 'timepicker/jquery.timepicker';

// own scripts
import * as schema from "./schema";

$(document).ready(function(){
    schema.bind();
});
