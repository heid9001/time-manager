import * as moment from 'moment';

const DISPLAY_FORMAT = 'DD.MM HH:mm';
const API            = 'http://localhost:3232'
var schemas = [];


const schemaModal = `
<div class="form-group">
    <label for="">Название</label>
    <input id="createSchemaName" type="text" class="form-control">
</div>
<div class="form-group">
    <label for="">Время в минутах</label>
    <select id="createSchemaTime" class="form-control">
        <option value="10">10</option>
        <option value="20">20</option>
        <option value="40">40</option>
    </select>
</div>
<button id="createSchemaSubmit" type="submit" class="btn btn-default">Создать</button>
`;

const entryModal = `
<div class="form-group">
    <div class="col-md-12">
        <label>Название</label>
        <input id="entryName" class='form-control'>
    </div>
</div>
<div class="form-group">
    <div class="col-md-12">
        <label for="">Время на перерыв (остаток: <span id="timeBalance"></span>)</label>
        <select id="createEntryTime" class="form-control">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="40">40</option>
        </select>
    </div>
</div>
<div class="form-group">
    <div class="col-md-6">
        <label>Начало</label>
        <div class='input-group date' id='dateFrom'>
            <input type='text' class="form-control" />
            <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
            </span>
        </div>
    </div>
    <div class="col-md-6">
        <label>Окончание</label>
        <div class='input-group date' id='dateTo'>
            <input type='text' class="form-control" />
            <span class="input-group-addon">
                <span class="glyphicon glyphicon-calendar"></span>
            </span>
        </div>
    </div>
</div>
<button id="createEntrySubmit" type="submit" class="btn btn-default">Создать</button>
`;


function getAllSchemas()
{
    let res;
    $.ajax({
        url: API + "/schema/list",
        async: false,
    }).done(function(data) {
        // console.log(JSON.parse(data))
        // redraw(JSON.parse(data));
        res = JSON.parse(data);
    });
    return res;
}

function postSchema(schema)
{
    $.ajax({
        url: API + "/schema",
        method: "POST",
        headers: {
            "Accept": "application/json"
        },
        data: schema,
        success: function(data) {
            console.log("from postSchema", data);
        },
    })
}

function postEntry(entry)
{
    let res = false;
    $.ajax({
        url: API + "/entry",
        method: "POST",
        headers: {
            "Accept": "application/json"
        },
        data: entry,
        success: function(data) {
            let o = JSON.parse(data);
            if (o.status === "ok") {
                res = o;
            }
        },
        async: false,
    });
    return res;
}

function delSchema(schemaId)
{
    $.ajax({
        url: API + "/schema",
        method: "DELETE",
        headers: {
            "Accept": "application/json"
        },
        data: { schemaId },
    });
}

function delEntry(entryId, schemaId)
{
    $.ajax({
        url: API + "/entry",
        method: "DELETE",
        headers: {
            "Accept": "application/json"
        },
        data: { entryId, schemaId },
    });
}

export function bind ()
{
    redraw();
    $("#newSchemaModal").click(function(){
        $('.modal-content').html(schemaModal);
        $('.modal').css('display', 'block');
        setTimeout(function(){
            $("#createSchemaTime").select2({tags: true});
            // AJAX
            $('#createSchemaSubmit').on('click', function(){
                postSchema({
                        name: $('#createSchemaName').val(),
                        time: parseInt($('#createSchemaTime').val()),
                        qty:  parseInt($('#createSchemaQty').val()),
                        entries: [],
                });
                console.log("postSchema");
                redraw();
                console.log("getAllSchema");
                $('.modal').css('display', 'none');
            });
        }, 500);
    });
    $("#closeModal").click(function(){
        $('.modal').css('display', 'none');
    });
};


setInterval(redraw, 10000);


function redraw()
{
    schemas = getAllSchemas();
    console.log(schemas);
    let carry = '';
    // список групп
    schemas.forEach( (s, i) => {
        let timeBalance = getTimeBalance(s.id);
        carry += 
        `<div class="panel panel-default">
            <div class="panel-heading">
                ${s.name}
                <button data-schema-index="${s.id}" type="button" class="deleteSchema btn btn-default btn-xs" style="float:right;">
                    <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
                </button>
            </div>
            <div class="panel-body">
                <p> не распределенно ${timeBalance} мин.</p>
        `
        carry += `<button data-index=${s.id} class="createEntryModal btn">Разместить перерыв</button>`

        // список оповещений
        s.entries.forEach((e, j) => {
            console.log(e);
            let badge = '';
            switch (parseInt(e.state)) {
                case 0:
                    badge = '<span class="badge badge-info">В очереди</span>';
                    break;
                case 1:
                    badge = '<span class="badge badge-success">Окончен</span>';
                    break;
            }
            carry += 
            `<div class="panel panel-default">
                <div class="panel-heading">
                    ${badge} ${e.name}
                    <button data-schema-index="${e.schemaId}" data-index="${j}" type="button" class="deleteEntry btn btn-default btn-xs" style="float:right;">
                        <span class="glyphicon glyphicon-trash" aria-hidden="true"></span>
                    </button>
                </div>
                <div class="panel-body">
                    <p>с ${moment(e.from).format(DISPLAY_FORMAT)} по ${moment(e.to).format(DISPLAY_FORMAT)}</p>
                </div>
            </div>`
        });
        carry += `
            </div>
        </div>`
    });
    $('#schemaList').html(carry);
    $('.deleteEntry').on('click', function(){
        delEntry(parseInt($(this).data('index')), $(this).data('schema-index'))
        redraw();
    });
    $('.deleteSchema').on('click', function(){
        delSchema($(this).data('schema-index'));
        redraw();
    });
    $('.createEntryModal').on('click', function(){
        let schemaIdx = $(this).data('index');
        let timeBalance = getTimeBalance(schemaIdx);
        let now = new Date();

        // инициализация виджетов
        $('.modal-content').html(entryModal);
        $("#createEntryTime").select2({tags: true});
        let timeDelta = parseInt($("#createEntryTime").val());
        $('#dateFrom').datetimepicker({format : DISPLAY_FORMAT, defaultDate: now,});
        $('#dateTo').datetimepicker({format : DISPLAY_FORMAT, defaultDate: moment(now).add(timeDelta, 'minutes').toDate(),});
        $('#dateTo').data("DateTimePicker").disable();
        
        $('#timeBalance').html(timeBalance);

        // показ модалки
        $('.modal').css('display', 'block');
        $('#createEntryTime').on('change', function(){
            timeDelta = parseInt($("#createEntryTime option:selected").text());
            let from = $('#dateFrom').data("DateTimePicker").viewDate();
            let to   = from.add(timeDelta, 'minutes').toDate();
            $('#dateTo').data("DateTimePicker").date(to);
        });
        $('#dateFrom').on('dp.change', function(){
            timeDelta = parseInt($("#createEntryTime option:selected").text());
            let from = $('#dateFrom').data("DateTimePicker").viewDate();
            let to   = from.add(timeDelta, 'minutes').toDate();
            $('#dateTo').data("DateTimePicker").date(to);
        });
        // AJAX
        $('#createEntrySubmit').on('click', () => {
            let time = parseInt($('#createEntryTime').val());
            let res = postEntry({
                schemaId: $(this).data('index'),
                from: $('#dateFrom').data("DateTimePicker").viewDate().format(),
                to:   $('#dateTo').data("DateTimePicker").viewDate().format(),
                name: $('#entryName').val(),
                time: time,
                state: 0,
            });
            if ( res ) {
                redraw();
                $('.modal').css('display', 'none');
            } else {
                alert(`Ошибка: превышен лимит времени!`);
            }
        });
    });
}

// получаем остаток времени для группы перерывов
function getTimeBalance(schemaId)
{
    let [schema] = getAllSchemas().filter(s => s.id === schemaId);
    let carry = 0;
    schema.entries.forEach((e, i) => {
        carry += e.time;
    });
    return schema.time - carry;
}
