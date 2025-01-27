import {useRef, useState, useEffect} from "react"
import {Routes, Route, useNavigate} from 'react-router-dom';
import {axiinstance, send_cryptoaddress} from "./config.jsx"
import axios from "axios";

const profile_logo = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const bank_logo = 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z'
const crypto_logo = 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'
const empty_avatar = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const info_icon = 'M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z'
const stats_logo = 'M4 6C4 5.33 4.55 5 5 5H19C19.45 5 20 5.33 20 6C20 6.67 19.45 7 19 7H5C4.55 7 4 6.67 4 6ZM4 12C4 11.33 4.55 11 5 11H19C19.45 11 20 11.33 20 12C20 12.67 19.45 13 19 13H5C4.55 13 4 12.67 4 12ZM4 18C4 17.33 4.55 17 5 17H19C19.45 17 20 17.33 20 18C20 18.67 19.45 19 19 19H5C4.55 19 4 18.67 4 18Z'

const banks = {
    'tbank': 'ТБанк (Тинькофф)',
    'sber': 'Сбер',
    'alfa': 'Альфа'
}

const currencies = {
    'rubles': 'Рубли',
    'tenge': 'Тенге'
}

function save_to_clipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Скопировано')
    })
}

function str_to_float(value) {
    const floated_amount = parseFloat(value.replace(/,/g, '.'))

    if (Number.isNaN(floated_amount)) {
        return false
    } else {
        return floated_amount
    }
}

function Profile({user}) {
    if (!user) {
        return <div className="loading"></div>
    }
    const [enable_tooltip, set_enable_tooltip] = useState(false)
    const tooltipRef = useRef(null);
    const [pop_up_stage, set_pop_up_stage] = useState(0)
    const [pop_up_amount, set_popup_amount] = useState(0)

    const [error, set_error] = useState('')


    function change_amount(event) {
        const rres = event.target.value.search(/[^0-9,.]/);

        if (rres !== -1) {
            set_error('popup_amount')
        } else if (str_to_float(event.target.value) === false) {
            set_error('popup_amount')
        } else {
            set_error('')
            set_popup_amount(str_to_float(event.target.value))
        }
    }

    async function click_button() {
        async function create_top_up_application() {
            await axiinstance.post('/application/create_topup/', {amount: pop_up_amount})

        }

        if (pop_up_amount === 0) {
            set_error('popup_amount')
        } else {
            if (error !== 'popup_amount') {

                set_pop_up_stage(pop_up_stage + 1)
            }
        }
        create_top_up_application()

    }

    function close_modal() {
        set_pop_up_stage(0)
        set_popup_amount('')
    }

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target)) {
                set_enable_tooltip(false); // Закрываем tooltip
            }
        };
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [])

    return (
        <div className="profile">

            <div className="column1">
                <div className="avatar">
                    <svg width="60" height="60" viewBox="0 0 24 24" fill="#666">
                        <path d={empty_avatar}/>
                    </svg>
                </div>
            </div>

            <div className="column2">
                <div className="field email">
                    {user.email ? 'Почта: ' + user.email : <p className="connect-email">Привязать почту</p>}
                </div>

                <div className="field telegram">
                    {user.tg_username ? 'Телеграм: @' + user.tg_username : 'Отсутсвует username'}
                </div>

                <div className="field tether-balance">
                    {'Баланс в tether: ' + user.tether_balance}
                </div>

                <div className="field pop-up" onClick={() => set_pop_up_stage(1)}>
                    <p>Пополнить баланс</p>
                </div>

                {user.email && (
                    <div className="field two-fa">
                        {user.two_fa === true ? '2FA включена' : <p className="enable-two-fa">Включить 2FA</p>}

                        <svg
                            className="info-icon"
                            width='20'
                            height='20'
                            viewBox="0 0 20 20"
                            fill="#666"
                            onClick={(e) => {
                                e.stopPropagation();
                                set_enable_tooltip((prev) => !prev);
                            }}
                        >
                            <path d={info_icon}/>
                        </svg>
                        {enable_tooltip &&
                            <span ref={tooltipRef} className="tooltip">Двухфакторная аутентификация защищает, даже если ваш телеграм находится в руках злоумышленника.</span>
                        }
                    </div>
                )}


            </div>

            {pop_up_stage !== 0 && (
                <div className="modal pop-up">
                    <div className="pop-up">
                        <button className="close-button" onClick={close_modal}>×</button>
                        <p className="title">Пополнение баланса</p>

                        {pop_up_stage === 1 &&
                            <div className="fields">
                                <div className="input-amount">
                                    <p className="field-name">Сумма в tether (usdt)</p>
                                    <input type="text" placeholder="0" onChange={(event) => change_amount(event)}
                                           className={`${error === 'popup_amount' && 'error-input'}`}/>
                                </div>

                                <button onClick={click_button}>Пополнить</button>
                            </div>
                        }
                        {pop_up_stage === 2 &&
                            <div>
                                <p>В течении 10 минут необходимо перевести <b>{pop_up_amount}</b> usdt по данному
                                    криптоадресу:<br/><br/> <span className="copy"
                                                                  onClick={(event) => save_to_clipboard(event.target.textContent)}>{send_cryptoaddress}</span>
                                </p>
                            </div>
                        }
                    </div>
                </div>
            )}

        </div>
    )
}

function Exchange({user}) {
    const [errors, set_errors] = useState(() => {
        const savedErrors = localStorage.getItem('form_errors');
        return savedErrors ? JSON.parse(savedErrors) : [{
            id: 1,
            card: false,
            phone: false,
            amount: false,
        }];
    });

    const [fields, set_fields] = useState(() => {
        const savedFields = localStorage.getItem('form_fields');
        return savedFields ? JSON.parse(savedFields) : [{
            id: 1,
            name: 'Вывод №1',
            card: '',
            phone: '+7 ',
            receiver: '',
            bank: 'sber',
            amount: '',
            currency: 'rubles',
            comment: '',
            minimized: false,
        }];
    });

    const [tab, set_tab] = useState(() => {
        const savedTab = localStorage.getItem('form_tab');
        return savedTab ? JSON.parse(savedTab) : 'fields'
    })
    const [patterns, set_patterns] = useState([])

    const modal_ref = useRef(null);
    const [modal_text, set_modal_text] = useState('');

    function set_modal(text) {
        set_modal_text(text);
        if (modal_ref.current) {
            modal_ref.current.show();
            setTimeout(() => {
                modal_ref.current.close();
                set_modal_text('')
            }, 3000);
        }
    }

    function change_param(event) {
        let id = parseInt(event.target.id)
        let key = event.target.className.split(' ')[0]
        let value = event.target.value

        if (key === 'name') {
            set_fields(fields.map(field =>
                field.id === id ? {...field, minimized: !field.minimized} : field
            ));
        }
        else if (key === 'card') {
            value = value.replace(/ /g, '').replace(/(.{4})(?=.)/g, '$1 ')
            if (/^[0-9 ]{0,19}$/.test(value)) {
                set_fields(fields.map(field =>
                    field.id === id ? {...field, [key]: value} : field
                ));
            }
            if (/^[0-9 ]{19}$/.test(value)) {
                set_errors(errors.map(dict => dict.id === id ? {...dict, card: false} : dict))
            }
        }
        else if (key === 'phone') {


            if (value.length > 16 || !/^[+0-9 -]*$/.test(value)) {
                return null
            } else if (!/^\+7 .*$/.test(value)) {
                return null
            } else if (/^\+7$/.test(value)) {
                value = value + ' '
            } else if (/^.* $/.test(value) && !/^\+7 $/.test(value)) {
                value = value.slice(0, -1)
            } else if (value.length === 6) {
                value = value + ' '
            } else if (value.length === 10) {
                value = value + '-'
            } else if (value.length === 13) {
                value = value + '-'
            } else if (/^.*-$/.test(value)) {
                value = value.slice(0, -1)
            }

            set_fields(fields.map(field =>
                field.id === id ? {...field, [key]: value} : field
            ));

            if (/^[+0-9 -]{16}$/.test(value)) {
                set_errors(errors.map(dict => dict.id === id ? {...dict, phone: false} : dict))
            }
            }
        else if (key === 'amount') {
            value = value.replace(/,/g, '.').replace(/ /g, '')
            if (/^[0-9,.]*$/.test(value) && (value.match(/\./g) || []).length < 2) {
                set_fields(fields.map(field =>
                    field.id === id ? {...field, [key]: value} : field
                ));
                check_field(event)
            }
        }
        else {
            set_fields(fields.map(field =>
                field.id === id ? {...field, [key]: value} : field
            ));
        }
    }

    async function check_field(event) {
        const id = parseInt(event.target.id)
        const key = event.target.className.split(' ')[0]
        const value = event.target.value
        if (key === 'card') {
            if (!/^[0-9 ]{19}$/.test(value)) {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, card: true} : dict))
            }
            else {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, card: false} : dict))
            }
        }
        else if (key === 'phone') {
            if (!/^[+0-9 -]{16}$/.test(value)) {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, phone: true} : dict))
            } else {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, phone: false} : dict))
            }
        }
        else if (key === 'amount') {
            let full_amount = 0
            fields.forEach(dict => {
                full_amount += str_to_float(dict.amount) ? parseFloat(dict.amount) : 0
            })
            if (!/^[0-9,.]*$/.test(value) || str_to_float(value) === false) {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, amount: true} : dict))
            }
            else if (user.tether_balance < str_to_float(value)) {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, amount: true} : dict))
            }
            else if (user.tether_balance < full_amount) {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, amount: true} : dict))
            }
            else {
                set_errors(prevState => prevState.map(
                    dict => dict.id === id ? {...dict, amount: false} : dict))
            }
        }
    }

    function check_all_fields() {
        fields.forEach(async dict => {
            await check_field({target: {id: dict.id, className: 'card', value: dict.card}})
            await check_field({target: {id: dict.id, className: 'phone', value: dict.phone}})
            await check_field({target: {id: dict.id, className: 'amount', value: dict.amount}})
        })
        let zero_errors = true
        errors.forEach(async dict => {
            if (dict.card || dict.phone || dict.amount) {
                zero_errors = false;
            }
        })
        return zero_errors
    }

    function add_new_form() {
        let new_id
        if (fields.length === 0) {
            new_id = 1
        } else {
            new_id = fields[fields.length - 1].id + 1
        }
        set_fields([...fields, {
            id: new_id,
            name: 'Вывод №' + (new_id).toString(),
            card: '',
            phone: '+7 ',
            receiver: '',
            bank: 'sber',
            amount: '',
            currency: 'rubles',
            comment: '',
            minimized: false,
        }])
        set_errors([...errors, {
            id: new_id,
            card: false,
            phone: false,
            amount: false
        }])

    }

    function clear_field(event) {
        const id = parseInt(event.target.id)
        let new_id = id
        if (fields.length === 1) {
            new_id = 1
        }
        set_errors(errors.map(dict => dict.id === id ? {
            id: new_id,
            card: false,
            phone: false,
            amount: false,
        } : dict))

        set_fields(fields.map(dict => dict.id === id ? {
            id: new_id,
            name: 'Вывод №' + new_id.toString(),
            card: '',
            phone: '+7 ',
            receiver: '',
            bank: 'sber',
            amount: '',
            currency: 'rubles',
            comment: '',
            minimized: false,
        } : dict))
    }

    function delete_field(event) {
        const id = parseInt(event.target.id)
        set_errors(errors.filter(dict => dict.id !== id));
        set_fields(fields.filter(dict => dict.id !== id));
    }

    async function save_pattern() {
        if (check_all_fields()) {
            let new_fields = fields.map(dict => {
                const {minimized, id, ...rest} = dict;
                return rest;
            })

            try {
                const response = await axiinstance.post('/user/save_pattern/', {
                    name: 'Шаблон',
                    fields: new_fields,
                })
                set_modal('Сохранено')
                window.location.reload()
            } catch (err) {
                set_modal('Уже существует')
            }
        }
    }

    function change_pattern(event) {
        const tagName = event.target.tagName
        const id = parseInt(event.target.id)
        const classname = event.target.className.split(' ')[0]
        console.log(classname)
        if (tagName === 'H3') {
            set_patterns(patterns.map(pattern =>
                pattern.id === id ? {...pattern, minimized: !pattern.minimized} : pattern
            ))
        } else if (classname === 'pattern-title') {
            const pattern_id = parseInt(event.target.dataset.pattern_id)
            set_patterns(patterns.map(pattern =>
                pattern.id === pattern_id ? {...pattern, fields: pattern.fields.map(field =>
                        field.id === id ? {...field, minimized: !field.minimized} : field
                    )} : pattern
            ))
        } else if (tagName === 'H4' || tagName === 'INPUT') {
            const pattern_id = parseInt(event.target.dataset.pattern_id)
            set_patterns(patterns.map(pattern =>
                pattern.id === pattern_id ? {...pattern, fields: pattern.fields.map(field =>
                        field.id === id ? {...field, chosen: !field.chosen} : field
                )
            } : pattern
            ))
        }
    }

    async function delete_pattern(id) {
        await axiinstance.delete('/user/pattern/?id=' + id)
        window.location.reload()
    }

    async function send_withdraw() {
        if (check_all_fields()) {
            const new_fields = fields.map(field => ({
                name: field.name,
                card: field.card,
                phone: field.phone,
                receiver: field.receiver,
                bank: field.bank,
                amount: field.amount,
                currency: field.currency,
                comment: field.comment,
            }))
            try {
                await axiinstance.post('/application/withdraw/', new_fields)
                set_modal('Заявка создана')
            } catch {

            }
        } else {
            set_modal('Исправьте ошибки')
        }
    }

    useEffect(() => {
        localStorage.setItem('form_errors', JSON.stringify(errors));

    }, [errors]);

    useEffect(() => {
        localStorage.setItem('form_fields', JSON.stringify(fields));
    }, [fields]);

    useEffect(() => {
        localStorage.setItem('form_tab', JSON.stringify(tab));
    }, [tab]);

    useEffect(() => {
        async function get_patterns() {
            const response = await axiinstance.get('/user/get_patterns/')
            const response_patterns = response.data
            let new_patterns = response_patterns.map(pattern => ({
                id: pattern.id,
                name: pattern.name,
                minimized: true,
                delete_stage: 0,
                fields: pattern.fields.map(field => ({...field,
                    minimized: true,
                    chosen: true,
                })),
            }))

            set_patterns(new_patterns)
        }
        get_patterns()
    }, [])

    return (
        <div className="exchange">
            <dialog ref={modal_ref} className='modal'>
                {modal_text}
            </dialog>
            <div className='top-buttons'>
                <button className={`${tab === 'fields' && 'active'}`} onClick={() => {
                    set_tab('fields')
                }}>
                    Заявка
                </button>
                <button className={`${tab === 'patterns' && 'active'}`} onClick={() => {
                    set_tab('patterns')
                }}>
                    Шаблоны
                </button>
            </div>

            <div className='forms'>
                {tab === 'fields' &&
                    <div className='form'>
                        <h2>Заявка на вывод</h2>
                        {fields.map(i => (
                            <div
                                id={i.id}
                                className={`fields ${i.minimized === true && 'minimized'} ${errors.some(error => error.id === i.id && (error.amount || error.card || error.phone)) ? 'error': ''}`}
                            >
                                <h3
                                    id={i.id}
                                    className='name'
                                    onClick={change_param}
                                >{i.name}</h3>
                                {!i.minimized && (
                                    <>
                                        <div className='input-group'>
                                            <p>Номер карты</p>
                                            <input
                                                type="text"
                                                id={i.id}
                                                className={`card 
                                                  ${errors.find(error => error.id === i.id)?.card && 'error-input'}
                                                `}
                                                value={i.card}
                                                onChange={change_param}
                                                onBlur={check_field}
                                            />
                                        </div>
                                        <div className='input-group'>
                                            <p>Номер телефона</p>
                                            <input
                                                type="text"
                                                id={i.id}
                                                className={`phone 
                                                  ${errors.find(error => error.id === i.id)?.phone && 'error-input'}
                                                `}
                                                value={i.phone}
                                                onChange={change_param}
                                                onBlur={check_field}
                                            />
                                        </div>
                                        <div className='input-group'>
                                            <p>Получатель</p>
                                            <input
                                                type="text"
                                                id={i.id}
                                                className='receiver'
                                                value={i.receiver}
                                                onChange={change_param}
                                            />
                                        </div>
                                        <div className='input-group'>
                                            <p>Банк</p>
                                            <select
                                                id={i.id}
                                                className='bank'
                                                onChange={change_param}
                                            >
                                                <option value="sber">Сбер</option>
                                                <option value="tbank">ТБанк (Тинькофф)</option>
                                                <option value="alfa">Альфа</option>
                                            </select>
                                        </div>
                                        <div className='input-group'>
                                            <p>Валюта</p>
                                            <select
                                                id={i.id}
                                                className='currency'
                                                onChange={change_param}
                                            >
                                                <option value="rubles">Рубли</option>
                                                <option value="tenge">Тенге</option>
                                            </select>
                                        </div>
                                        <div className='input-group'>
                                            <p>Сумма</p>
                                            <input
                                                type="text"
                                                id={i.id}
                                                className={`amount 
                                                    ${errors.find(error => error.id === i.id)?.amount && 'error-input'}
                                                `}
                                                value={i.amount}
                                                onChange={change_param}
                                                onBlur={check_field}
                                            />
                                        </div>
                                        <div className='input-group'>
                                            <p>Комментарий</p>
                                            <input
                                                type="text"
                                                id={i.id}
                                                className='comment'
                                                value={i.comment}
                                                onChange={change_param}
                                            />
                                        </div>
                                        <div className='field-buttons'>
                                            <button
                                                id={i.id}
                                                onClick={clear_field}
                                            >Очистить
                                            </button>
                                            {fields.length > 1 && (
                                                <button
                                                    id={i.id}
                                                    onClick={delete_field}
                                                >Удалить</button>
                                            )}
                                        </div>

                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                }
                {tab === 'patterns' &&
                    <div className='patterns'>
                        <h2>Шаблоны</h2>
                        {patterns.map(i => (
                            <div
                                className={`pattern ${i.minimized ? 'minimized': ''}`}
                            >
                                <h3
                                    id={i.id}
                                    onClick={change_pattern}
                                >{i.name}</h3>
                                {!i.minimized && (
                                    <>
                                    {i.fields.map(ii => (
                                            <div className={`pattern-form ${ii.minimized ? 'minimized': ''}`}>
                                                <div
                                                    className='pattern-title'
                                                    data-pattern_id={i.id}
                                                    id={ii.id}
                                                    onClick={change_pattern}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={ii.chosen}
                                                        data-pattern_id={i.id}
                                                        id={ii.id}
                                                    />
                                                    <h4
                                                        data-pattern_id={i.id}
                                                        id={ii.id}
                                                    >{ii.name}</h4>
                                                </div>
                                                {!ii.minimized && (
                                                    <>
                                                        <p>Карта: {ii.card}</p>
                                                        <p>Телефон: {ii.phone}</p>
                                                        <p>Получатель: {ii.receiver}</p>
                                                        <p>Банк: {banks[ii.bank]}</p>
                                                        <p>Сумма: {ii.amount}</p>
                                                        <p>Валюта: {currencies[ii.currency]}</p>
                                                        <p>Комментарий: {ii.comment}</p>
                                                    </>
                                                )}
                                            </div>
                                        ))
                                    }
                                    <div className='pattern-buttons'>
                                        <button
                                            onClick={() => {
                                                set_fields(i.fields.filter(field => field.chosen).map(field => ({
                                                    id: field.id,
                                                    name: field.name,
                                                    card: field.card,
                                                    phone: field.phone,
                                                    receiver: field.receiver,
                                                    bank: field.bank,
                                                    amount: field.amount,
                                                    currency: field.currency,
                                                    comment: field.comment,
                                                    minimized: true
                                                })));
                                                set_errors(i.fields.filter(field => field.chosen).map(field => ({
                                                    id: field.id,
                                                    card: false,
                                                    phone: false,
                                                    amount: false
                                                })))
                                                set_tab('fields');
                                                set_modal('Шаблон удалён')
                                            }}
                                        >Использовать</button>
                                        {i.delete_stage === 0 &&
                                            <button
                                                onClick={() => {
                                                    set_patterns(patterns.map(pattern =>
                                                        pattern.id === i.id ? {...pattern, delete_stage: 1} : pattern
                                                    ));
                                                }}
                                            >Удалить</button>
                                        }
                                        {i.delete_stage === 1 &&
                                            <button
                                                onClick={() => {
                                                    delete_pattern(i.id)
                                                }}
                                            >Уверены?</button>
                                        }
                                    </div>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                }
            </div>

            <div className='bottom-buttons'>
                {tab === 'fields' &&
                    <>
                        <button
                            className='add-form'
                            onClick={add_new_form}
                        >✚</button>
                        <button
                            className={`${errors.some(error => (error.amount || error.card || error.phone)) ? 'inactive' : ''}`}
                            onClick={send_withdraw}
                        >Отправить</button>
                        <button
                            onClick={save_pattern}
                        >Сохранить</button>
                    </>
                }
            </div>
        </div>
    )
}

function Stats({user}) {
    const [transactions, set_transactions] = useState([])
    const [transaction_type, set_transaction_type] = useState('all');
    const [filtered_transactions, set_filtered_transactions] = useState([]);
    const [sortConfig, setSortConfig] = useState({key: 'datetime', direction: 'desc'});

    useEffect(() => {
        async function get_stats() {
            const response = await axiinstance.get('/user/stats/')

            set_transactions(response.data)
        }

        get_stats()

    }, [])

    const getSortArrow = (column) => {
        if (sortConfig.key === column) {
            return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
        }
        return ''; // Возвращаем пустую строку, если это не текущий столбец для сортировки
    };

    const change_type = () => {
        const newType =
            transaction_type === 'all'
                ? 'topup'
                : transaction_type === 'topup'
                    ? 'payout'
                    : 'all';
        set_transaction_type(newType); // Меняем тип операции
    };

    const sortTransactions = (key) => {
        let direction = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        } else if (sortConfig.key === key && sortConfig.direction === 'desc' && sortConfig.key !== 'datetime') {
            key = 'datetime'
            direction = 'desc'
        }
        setSortConfig({key, direction}); // Обновляем состояние сортировки
    };

    // Фильтрация и сортировка через useEffect
    useEffect(() => {
        // Фильтруем по типу операции
        var filtered = transaction_type === 'all'
            ? transactions
            : transactions.filter((transaction) => transaction.type === transaction_type);

        const sortedTransactions = [...filtered].sort((a, b) => {
            const valueA = sortConfig.key === 'datetime' ? new Date(a[sortConfig.key]) : a[sortConfig.key];
            const valueB = sortConfig.key === 'datetime' ? new Date(b[sortConfig.key]) : b[sortConfig.key];

            if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        // Форматируем даты
        const formattedTransactions = sortedTransactions.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''), // Форматируем дату
        }));


        set_filtered_transactions(formattedTransactions);
    }, [transaction_type, sortConfig, transactions]); // Пересчитываем при изменении фильтра или сортировки

    return (
        <div className="stats">
            <div className="top">
                <h3>Текущий баланс</h3>
                <h1><span id="balance">{user.tether_balance}</span> USDT</h1>
            </div>

            <div className="stats-table">
                <table>
                    <thead>
                    <tr>
                        <th onClick={() => sortTransactions('datetime')}>Дата{getSortArrow('datetime')}</th>
                        <th
                            className={transaction_type + '-type'}
                            onClick={change_type}>Тип операции
                        </th>
                        <th onClick={() => sortTransactions('amount')}>Сумма{getSortArrow('amount')}</th>
                        <th>Валюта</th>
                        <th onClick={() => sortTransactions('amount_in_usd')}>USD{getSortArrow('amount_in_usd')}</th>
                    </tr>
                    </thead>
                    <tbody>
                    {filtered_transactions.length > 0 &&
                        filtered_transactions.map((i) => (
                            <tr key={i.id}>
                                <td>{i.datetime}</td>
                                <td><span
                                    className={`transaction-type ${i.type}-type`}>{i.type === 'topup' ? 'Пополение' : 'Вывод'}</span>
                                </td>
                                <td>{i.amount}</td>
                                <td>{i.currency}</td>
                                <td>${i.amount_in_usd}</td>
                            </tr>
                        ))
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function Currencies() {
    const [currencies, set_currencies] = useState([])
    const [query, setQuery] = useState(''); // Для хранения запроса
    const [cryptoData, setCryptoData] = useState(null); // Для хранения данных криптовалюты
    const [error, setError] = useState(''); // Для хранения сообщения об ошибке


    const handleSearch = async (e) => {
        if (e.key === 'Enter') {
            try {
                const response = await axios.get('https://api.coincap.io/v2/assets/' + query.toLowerCase());

                setCryptoData({
                    name: response.data.data['name'],
                    priceUsd: response.data.data['priceUsd']
                });
                setError('');

            } catch (err) {
                setCryptoData(null);
                setError('Нет результатов');
            }
        }
    };

    useEffect(() => {
        async function get_currencies() {
            const response = await axios.get('https://api.coincap.io/v2/assets/?limit=24')

            set_currencies(response.data.data)
        }

        get_currencies()
    }, [])

    return (
        <div className="currencies">
            <input
                type='text'
                placeholder="Поиск"
                className="search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleSearch}
            />
            {cryptoData && (
                <p className="dropdown">{cryptoData['name']} - {cryptoData['priceUsd']}$</p>
            )}
            {error && <p className="dropdown">{error}</p>}

            <div className="currency-tabs">
                {currencies.length === 0 ? <div className="loading"></div> :
                    currencies.map((curr) => (
                        <div className="currency-tab">
                            <p className="name">{curr['name']}</p>
                            <p className="price">{parseFloat(curr['priceUsd']).toFixed(5)}$</p>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default function Home({id}) {
    const [activeLabel, setActiveLabel] = useState(""); // Стейт для отслеживания активной кнопки
    const navigate = useNavigate();
    const [user, set_user] = useState(null);

    function labelClick(label, path) {
        setActiveLabel(label); // Устанавливаем текущую активную кнопку
        navigate(path); // Выполняем навигацию
    }

    useEffect(() => {
        async function load_user() {
            const res = await axiinstance.get("user/get_user/", {withCredentials: true});
            set_user(res.data);
        }

        load_user();
    }, [id]);

    useEffect(() => {
        const pathToLabelMap = {
            "/profile": "profile",
            "/exchange": "exchange",
            "/stats": "stats",
            "/currencies": "currencies",
        };

        // Устанавливаем активную метку в зависимости от текущего маршрута
        const currentPath = location.pathname;
        setActiveLabel(pathToLabelMap[currentPath] || "profile"); // По умолчанию "profile"
    }, []);


    return (
        <div className="home">
            <div className="container">
                <div className="labels">
                    <button className={`label exchange ${activeLabel === "exchange" ? "active" : ""}`}
                            onClick={() => labelClick("exchange", "/exchange")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={bank_logo}/>
                        </svg>
                        <span className="label-text">Обмен</span>
                    </button>

                    <button className={`label stats ${activeLabel === "stats" ? "active" : ""}`}
                            onClick={() => labelClick("stats", "/stats")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={stats_logo}/>
                        </svg>
                        <span className="label-text">Статистика</span>
                    </button>

                    <button className={`label currencies ${activeLabel === "currencies" ? "active" : ""}`}
                            onClick={() => labelClick("currencies", "/currencies")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={crypto_logo}/>
                        </svg>
                        <span className="label-text">Валюты</span>
                    </button>

                    <button className={`label profile ${activeLabel === "profile" ? "active" : ""}`}
                            onClick={() => labelClick("profile", "/profile")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={profile_logo}/>
                        </svg>
                        <span className="label-text">Профиль</span>
                    </button>

                </div>

                {!user ? <div className="loading"></div> :
                    <div className="tab">
                        <Routes>
                            <Route path="/profile" element={<Profile user={user}/>}/>
                            <Route path="/exchange" element={<Exchange user={user}/>}/>
                            <Route path="/stats" element={<Stats user={user}/>}/>
                            <Route path="/currencies" element={<Currencies/>}/>
                        </Routes>
                    </div>
                }
            </div>
        </div>
    );
}
