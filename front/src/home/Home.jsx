import { useRef, useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, createPath } from 'react-router-dom';
import { axiinstance, send_cryptoaddress } from "../config"
import axios from "axios";

const profile_logo = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const bank_logo = 'M4 10v7h3v-7H4zm6 0v7h3v-7h-3zM2 22h19v-3H2v3zm14-12v7h3v-7h-3zm-4.5-9L2 6v2h19V6l-9.5-5z'
const crypto_logo = 'M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z'
const empty_avatar = 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'
const info_icon = 'M10 3a7 7 0 100 14 7 7 0 000-14zm-9 7a9 9 0 1118 0 9 9 0 01-18 0zm8-4a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm.01 8a1 1 0 102 0V9a1 1 0 10-2 0v5z'
const stats_logo = 'M4 6C4 5.33 4.55 5 5 5H19C19.45 5 20 5.33 20 6C20 6.67 19.45 7 19 7H5C4.55 7 4 6.67 4 6ZM4 12C4 11.33 4.55 11 5 11H19C19.45 11 20 11.33 20 12C20 12.67 19.45 13 19 13H5C4.55 13 4 12.67 4 12ZM4 18C4 17.33 4.55 17 5 17H19C19.45 17 20 17.33 20 18C20 18.67 19.45 19 19 19H5C4.55 19 4 18.67 4 18Z'

function save_to_clipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        alert('Скопировано')
    })
}

function str_to_float(value) {
    const floated_amount = parseFloat(value.replace(/,/g, '.'))
    console.log(floated_amount)
    if (Number.isNaN(floated_amount)) {
        return false
    } else {
        return floated_amount
    }
}

function Profile({user}) {
    if(!user) {return <div className="loading"></div>}
    const [enable_tooltip, set_enable_tooltip] = useState(false)
    const tooltipRef = useRef(null);
    const [pop_up_stage, set_pop_up_stage] = useState(0)
    const [pop_up_amount, set_popup_amount] = useState(0)

    const [error, set_error] = useState('')


    function change_amount(event) {
        const rres = event.target.value.search(/[^0-9,.]/);

        if(rres != -1) {
            set_error('popup_amount')
        } else if (str_to_float(event.target.value) === false) {
            set_error('popup_amount')
        } else {
            set_error('')
            set_popup_amount(str_to_float(event.target.value))
        }
    }

    function click_button() {
        if(pop_up_amount === 0) {
            set_error('popup_amount')
        } else {
            if(error !== 'popup_amount') {
                set_pop_up_stage(pop_up_stage + 1)
            }
        }
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
                <div className="name">
                    {user.first_name}
                </div>

                <div className="field email">
                    {user.email ? 'Почта: ' + user.emal : <p className="connect-email">Привязать почту</p>}
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
                        {user.two_fa == true ? '2FA включена' : <p className="enable-two-fa">Включить 2FA</p>}
                        
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

            {pop_up_stage != 0 && (
                <div className="modal pop-up">
                    <div className="pop-up">
                        <button className="close-button" onClick={close_modal}>×</button>
                        <p className="title">Пополнение баланса</p>

                        {pop_up_stage == 1 &&
                            <div className="fields">
                                <div className="input-amount">
                                    <p className="field-name">Сумма в tether (usdt)</p>
                                    <input type="text" placeholder="0"  onChange={(event) => change_amount(event)} className={`${error == 'popup_amount' && 'error-input'}`}/>
                                </div>

                                <button onClick={click_button}>Пополнить</button>
                            </div>
                        }
                        {pop_up_stage == 2 &&
                            <div>
                                <p>В течении 10 минут необходимо перевести <b>{pop_up_amount}</b> usdt по данному криптоадресу:<br /><br /> <span className="copy" onClick={(event) => save_to_clipboard(event.target.textContent)}>{send_cryptoaddress}</span> </p>
                            </div>
                        }
                    </div>
                </div>
            )}

        </div>
    )
}

function Exchange({user}) {
    if(!user) {return <div className="loading">Загрузка...</div>}
    const [step, set_step] = useState(1)
    const [value, set_value] = useState(null)
    const [bank, set_bank] = useState('sber')
    const [currency, set_currency] = useState('rubles')
    const [number, set_number] = useState(null)
    const [rates, set_rates] = useState(null)

    function click_next() {
        if(value && bank && number) {
            set_step(step + 1)
        }
        if(step == 2) {
            async function send_application_to_tg() {
                const response = await axiinstance.post('application/create_application/', 
                        {
                            value: value,
                            bank: bank,
                            number: number,
                            currency: currency
                        }
                    )
                }

                console.log(response.request)
                console.log(value, bank, number, currency)
            send_application_to_tg()
        }
    }

    useEffect(() => {
        async function get_tether_and_rubles_rate() {
            const res = await axios.get('https://api.coincap.io/v2/assets/?ids=tether')
            const tether_rate = res.data.data[0]['priceUsd']
            const res2 = await axios.get('https://www.cbr-xml-daily.ru/daily_json.js')
            const rubles_rate = res2.data.Valute['USD']['Value']
            set_rates({
                'dollar_in_tether': parseFloat(tether_rate),
                'ruble_in_dollar': parseFloat(rubles_rate)
            })
        }
        get_tether_and_rubles_rate()
        }, []);

    return (
        <div className="exchange">
            <p className="title">Вывод средств</p>

            <div className="fields">
                { step == 1 &&
                     <>
                        <div className="input-value">
                            <p className="field-name">Сумма (USDT)</p>
                            <input type="text" placeholder="0" onChange={(event) => set_value(parseFloat(event.target.value))}/>
                        </div>

                        <div className="input-bank">
                            <p className="field-name">Банк</p>
                            <select type="text" placeholder="Сбер" onChange={(event) => set_bank(event.target.value)}>
                                <option value="sber">Сбер</option>
                                <option value="tbank">ТБанк (Тинькофф)</option>
                                <option value="alfa">Альфа</option>
                                <option value="vtb">ВТБ</option>
                                <option value="open">Открытие</option>
                            </select>
                        </div>

                        <div className="input-currency">
                            <p className="field-name">Валюта</p>
                            <select type="text" placeholder="Сбер" onChange={(event) => set_currency(event.target.value)}>
                                <option value="rubles">Рубли</option>
                            </select>
                        </div>

                        <div className="input-number">
                            <p className="field-name">Номер карты или телефона (если подключён СБП)</p>
                            <input type="text" placeholder="Номер" onChange={(event) => set_number(event.target.value)}/>
                        </div>

                        <button onClick={click_next}>
                            Далее
                        </button>
                    </>
                }
                { step == 2 &&
                    <>
                        <div className="value_info">
                            <p>Обмен <u>{value}</u> tether (USDT) в рубли</p>
                        </div>
                        <div className="value_info">
                            {rates ? (<p>В долларах: <u>{value * rates.dollar_in_tether}</u></p>) : (<div>Загрузка...</div>)}
                        </div>
                        <div className="value_info">
                            {rates ? (<p>В рублях: <u>{value * rates.dollar_in_tether * rates.ruble_in_dollar}</u></p>) : (<div>Загрузка...</div>)}
                        </div>

                        <button onClick={click_next}>
                            Создать заявку
                        </button>
                    </>
                }
                { step == 3 && 
                    <>
                        <div>
                            <p>Ваша заявка обрабатывается (это может занять до 5 часов в рабочее время)</p>
                        </div>
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
    const [sortConfig, setSortConfig] = useState({ key: 'datetime', direction: 'asc' });

    useEffect(() => {
        async function get_stats() {
            const response = await axiinstance.get('/user/stats/')
            console.log(response.data)
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
        } else if (sortConfig.key == key && sortConfig.direction === 'desc') {
            key = 'datetime'
            direction = 'asc'
        }
        setSortConfig({ key, direction }); // Обновляем состояние сортировки
    };

    // Фильтрация и сортировка через useEffect
    useEffect(() => {
        // Фильтруем по типу операции
        var filtered = transaction_type === 'all'
            ? transactions
            : transactions.filter((transaction) => transaction.type === transaction_type);
        
        filtered = filtered.map((transaction) => {
            const date = new Date(transaction.datetime)
            return {
                ...transaction,
                datetime: date.toLocaleString('ru-RU')
            }
        })
        console.log(filtered)

        const sortedTransactions = [...filtered].sort((a, b) => {
            const valueA = sortConfig.key === 'datetime' ? new Date(a[sortConfig.key]) : a[sortConfig.key];
            const valueB = sortConfig.key === 'datetime' ? new Date(b[sortConfig.key]) : b[sortConfig.key];

            if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });

        set_filtered_transactions(sortedTransactions);
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
                                className={transaction_type+'-type'}
                                onClick={change_type}>Тип операции</th>
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
                                    <td> <span className={`transaction-type ${i.type}-type`}>{i.type == 'topup' ? 'Пополение' : 'Вывод'}</span></td>
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
            console.log(response.data)
            setCryptoData({
                name: response.data.data['name'],
                priceUsd: response.data.data['priceUsd']
            });
            setError('');
            console.log(cryptoData)
        } catch (err) {
            setCryptoData(null);
            setError('Нет результатов');
        }
        }
      };
    
    useEffect(() => {
        async function get_currencies() {
            const response = await axios.get('https://api.coincap.io/v2/assets/?limit=24')
            console.log(response.data.data)
            set_currencies(response.data.data)
        }
        get_currencies()
    }, [])

    return (
        <div className="currencies">
            <input
                type='text'
                placeholder="Поиск"
                className="find"
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

export default function Home({ id }) {
    const [activeLabel, setActiveLabel] = useState(""); // Стейт для отслеживания активной кнопки
    const navigate = useNavigate();
    const [user, set_user] = useState(null);

    function labelClick(label, path) {
        setActiveLabel(label); // Устанавливаем текущую активную кнопку
        navigate(path); // Выполняем навигацию
    }

    useEffect(() => {
        async function load_user() {
            const res = await axiinstance.get("user/get_user/", { withCredentials: true });
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
    }, [location]);


    return (
        <div className="home">
            <div className="container">
                <div className="labels">
                    <button className={`label profile ${activeLabel === "profile" ? "active" : ""}`}
                            onClick={() => labelClick("profile", "/profile")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={profile_logo} />
                        </svg>
                        <span className="label-text">Профиль</span>
                    </button>

                    <button className={`label exchange ${activeLabel === "exchange" ? "active" : ""}`}
                            onClick={() => labelClick("exchange", "/exchange")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={bank_logo} />
                        </svg>
                        <span className="label-text">Обмен</span>
                    </button>
                    
                    <button className={`label stats ${activeLabel === "stats" ? "active" : ""}`}
                            onClick={() => labelClick("stats", "/stats")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={stats_logo} />
                        </svg>
                        <span className="label-text">Статистика</span>
                    </button>
                    
                    <button className={`label currencies ${activeLabel === "currencies" ? "active" : ""}`}
                            onClick={() => labelClick("currencies", "/currencies")}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d={crypto_logo} />
                        </svg>
                        <span className="label-text">Валюты</span>
                    </button>
                </div>

                {!user ? <div className="loading"></div> :
                    <div className="tab">
                        <Routes>
                            <Route path="/profile" element={<Profile user={user} />} />
                            <Route path="/exchange" element={<Exchange user={user} />} />
                            <Route path="/stats" element={<Stats user={user} />} />
                            <Route path="/currencies" element={<Currencies />} />
                        </Routes>
                    </div>
                }
            </div>
        </div>
    );
}
