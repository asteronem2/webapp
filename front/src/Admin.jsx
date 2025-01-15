import {useEffect, useRef, useState} from "react";
import {axiinstance} from "./config.jsx";
import {Routes, Route, Navigate, useNavigate, useLocation} from "react-router-dom";

const banks = {
    'tbank': 'ТБанк (Тинькофф)',
    'sber': 'Сбер',
    'alfa': 'Альфа'
}
const statuses = {
    'completed': 'Выполнено',
    'waiting': 'Ожидание',
    'reject': 'Отклонено'
}

function Auth() {
    const [token, setToken] = useState('');
    const [tokenError, setTokenError] = useState(false);
    function changeToken (event) {
        setToken(event.target.value)
        setTokenError(false);
    }
    async function checkToken() {
        const response = await axiinstance.post('/admin/auth/', {token: token})
        if (response.data.access === true) {
            window.location.reload();
        } else (
            setTokenError(true)
        )
    }
    return (
        <div className='auth'>
            <div className='tab'>
                <h2>Вход в админ панель</h2>
                <input type="text" placeholder='Токен' value={token} onChange={changeToken} className={tokenError ? 'error-input' : ''}/>
                <button onClick={checkToken}>Войти</button>
            </div>
        </div>
    )
}

function Stats() {
    return (
        <div className='stats'>
            <div className='info-list'>
                <div className='info'>
                    <p className='title'>Сумма выплат</p>
                    <p className='value'>0</p>
                </div>
                <div className='info'>
                    <p className='title'>Сумма комиссий</p>
                    <p className='value'>0</p>
                </div>
                <div className='info'>
                    <p className='title'>Заявки в ожидании</p>
                    <p className='value'>0</p>
                </div>
                <div className='info'>
                    <p className='title'>Выполненные заявки</p>
                    <p className='value'>0</p>
                </div>
            </div>
        </div>
    )
}

function Withdraws() {
    const [withdraws, setWithdraws] = useState([]);
    const [filteredWithdraws, setFilteredWithdraws] = useState([]);
    const [sortConfig, setSortConfig] = useState({field: 'datetime', direction: 'desc', name: 'Новые'})
    const [filterConfig, setFilterConfig] = useState({
        banks: [...Object.keys(banks)],
        tags: [],
        statuses: [...Object.keys(statuses)],
        currency: [],
        amount: {min: '', max: '', in_usd: false},
    })
    const [filterVisible, setFilterVisible] = useState({
        banks: false,
        statuses: false,
    })
    const [modal, setModal] = useState(null)
    const [inputTagId, setInputTagId] = useState(null)
    const inputRef = useRef(null)

    function sortArrow(field) {
        if (field === sortConfig.field) {
            return sortConfig.direction === 'asc' ? ' ↓' : ' ↑';
        }
        return ''
    }

    async function save_tag(id, tag) {
        await axiinstance.patch('/admin/withdraw/update_tag/', {tag: tag, id: id})
        window.location.reload()
    }

    useEffect(() => {
        async function getWithdraws() {
            const response = await axiinstance.get('/admin/withdraws/');
            if (response.data) {
                setWithdraws(response.data);
            }
        }
        getWithdraws()
    }, []);

    useEffect(() => {
        let filtered = [...withdraws]

        if (filterConfig.amount.min !== '' || filterConfig.amount.max !== '') {
            const min_value = filterConfig.amount.min === '' ? 0 : parseFloat(filterConfig.amount.min)
            const max_value = filterConfig.amount.max === '' ? Infinity : parseFloat(filterConfig.amount.max)

            filtered = filtered.filter((i) => {
                let value
                if (filterConfig.amount.in_usd) {
                    value = parseFloat(i.amount_in_usd)
                } else {
                    value = parseFloat(i.amount);
                }
                return value >= min_value && value <= max_value;
            })
        }
        filtered = filtered.filter((i) => {
            return filterConfig.banks.some((ii) => ii === i.bank)
        })
        filtered = filtered.filter((i) => {
            return filterConfig.statuses.some((ii) => ii === i.status)
        })

        const sorted = [...filtered].sort((a, b) => {
            const valueA = sortConfig.field === 'datetime' ? new Date(a[sortConfig.field]) : a[sortConfig.field];
            const valueB = sortConfig.field === 'datetime' ? new Date(b[sortConfig.field]) : b[sortConfig.field];

            if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        })

        const formattedWithdraws = sorted.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''),
            amount: parseFloat(transaction.amount.toFixed(2)),
            amount_in_usd: parseFloat(transaction.amount_in_usd.toFixed(2)),
        }));

        setFilteredWithdraws(formattedWithdraws);

    }, [withdraws, sortConfig, filterConfig]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.focus();
        }
    }, [inputTagId]);

    return (
        <div className='withdraws'>
            {modal && (
                <div className='modal' onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        setModal(null)
                    }
                }}>
                    {modal === 'sort' && (
                        <div className="modal-tab" onClick={(event) => {
                            if (event.target.className !== 'inactive' && event.target.tagName === 'BUTTON') {
                                setModal(null);
                            }}}>
                            <h3>Сортировать по:</h3>
                            <button
                                className={sortConfig.field === 'datetime' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})}
                            >Новые</button>
                            <button
                                className={sortConfig.field === 'datetime' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'datetime', direction: 'asc', name: 'Старые'})}
                            >Старые</button>
                            <button
                                className={sortConfig.field === 'amount' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})}
                            >Сумма больше</button>
                            <button
                                className={sortConfig.field === 'amount' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount', direction: 'asc', name: 'Сумма меньше'})}
                            >Сумма меньше</button>
                            <button
                                className={sortConfig.field === 'amount_in_usd' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})}
                            >Сумма $ больше</button>
                            <button
                                className={sortConfig.field === 'amount_in_usd' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount_in_usd', direction: 'asc', name: 'Сумма $ меньше'})}
                            >Сумма $ меньше</button>
                        </div>
                    )}
                    {modal === 'filter' && (
                        <div className='modal-tab filter'>
                            <div className='amount'>
                                <h3>Сумма</h3>
                                <div className='checkbox' onClick={() => {
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, in_usd: !filterConfig.amount.in_usd}})
                                }}>
                                    <input type="checkbox" checked={filterConfig.amount.in_usd}/>
                                    <p>в долларах</p>
                                </div>
                                От: <input type="text" className='input-text' value={filterConfig.amount.min} onChange={(event) => {
                                    if (/^(\d*|\d+[,.]\d*)$/.test(event.target.value)) {
                                        const new_value = event.target.value.replace(/,/, '.')
                                        setFilterConfig({...filterConfig, amount: {...filterConfig.amount, min: new_value}})
                                    }}}
                                /> до: <input type="text" className='input-text' value={filterConfig.amount.max} onChange={(event) => {
                                if (/^(\d*|\d+[,.]\d*)$/.test(event.target.value)) {
                                    const new_value = event.target.value.replace(/,/, '.')
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, max: new_value}})
                                    }}}
                                />
                            </div>
                            <div className={`banks${!filterVisible.banks ? ' minimized' : ''}`}>
                                <h3
                                    onClick={() => setFilterVisible({...filterVisible, banks: !filterVisible.banks})}
                                >Банки</h3>
                                {filterVisible.banks &&
                                    <>
                                        {Object.keys(banks).map(bank => (
                                            <div className='checkbox' onClick={() => {
                                                if (filterConfig.banks.some(i => i === bank)) {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        banks: filterConfig.banks.filter((i) => i !== bank)
                                                    });
                                                } else {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        banks: [...filterConfig.banks, bank]
                                                    });
                                                }
                                            }}>
                                                <input type="checkbox"
                                                       checked={filterConfig.banks.some((i) => i === bank)}/>
                                                <p>{banks[bank]}</p>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                            <div className={`status${!filterVisible.statuses ? ' minimized' : ''}`}>
                                <h3
                                    onClick={() => setFilterVisible({
                                        ...filterVisible,
                                        statuses: !filterVisible.statuses
                                    })}
                                >Статус</h3>
                                {filterVisible.statuses &&
                                    <>
                                        {Object.keys(statuses).map(status => (
                                            <div className={`checkbox ${status}`} onClick={() => {
                                                if (filterConfig.statuses.some(i => i === status)) {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        statuses: filterConfig.statuses.filter((i) => i !== status)
                                                    });
                                                } else {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        statuses: [...filterConfig.statuses, status]
                                                    });
                                                }
                                            }}>
                                                <input type="checkbox"
                                                       checked={filterConfig.statuses.some((i) => i === status)}/>
                                                <p>{statuses[status]}</p>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className='filter_and_sort'>
                <button className='sort' onClick={() => setModal('sort')}>
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                        <path d='M 4.207,-2.798598e-8 0,4.207 1.414,5.621 3.207,3.828 v 10.586 h 2 V 3.828 L 7,5.621 8.414,4.207 Z M 11.207,14.828 7,10.621 8.414,9.207 10.207,11 V 0.41399997 h 2 V 11 L 14,9.207 l 1.414,1.414 z'/>
                    </svg>
                    &nbsp;{sortConfig.name}
                </button>
                <button className='filter' onClick={() => setModal('filter')}>
                Фильтры
                </button>
            </div>
            <div className='table'>
                <table>
                    <thead>
                        <tr>
                            <th
                                onClick={() => {
                                    if (sortConfig.field === 'datetime') {
                                        if (sortConfig.direction === 'asc') {
                                            setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                        } else {
                                            setSortConfig({field: 'datetime', direction: 'asc', name: 'Старые'})
                                        }
                                    } else {
                                        setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                    }
                                }}
                            >Дата{sortArrow('datetime')}</th>
                            <th>Пользователь</th>
                            <th>Телефон</th>
                            <th>Карта</th>
                            <th>Получатель</th>
                            <th>Банк</th>
                            <th>Метка</th>
                            <th>Статус</th>
                            <th>Валюта</th>
                            <th
                                onClick={() => {
                                    if (sortConfig.field === 'amount') {
                                        if (sortConfig.direction === 'asc') {
                                            setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                        } else {
                                            setSortConfig({field: 'amount', direction: 'asc', name: 'Сумма меньше'})
                                        }
                                    } else {
                                        setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                    }
                                }}
                            >Сумма{sortArrow('amount')}</th>
                            <th
                                onClick={() => {
                                    if (sortConfig.field === 'amount_in_usd') {
                                        if (sortConfig.direction === 'asc') {
                                            setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})
                                        } else {
                                            setSortConfig({field: 'amount_in_usd', direction: 'asc', name: 'Сумма $ меньше'})
                                        }
                                    } else {
                                        setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})
                                    }
                                }}

                            >Сумма ${sortArrow('amount_in_usd')}</th>
                            <th>Комментарий</th>
                        </tr>
                    </thead>
                    <tbody>
                    {filteredWithdraws.length > 0 &&
                            filteredWithdraws.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.datetime}</td>
                                    <td>{i.user}</td>
                                    <td>{i.phone}</td>
                                    <td>{i.card}</td>
                                    <td>{i.receiver}</td>
                                    <td>{banks[i.bank]}</td>
                                    <td
                                        onDoubleClick={() => {setInputTagId(inputTagId === i.id ? null : i.id)}}
                                    >
                                        {inputTagId !== i.id ?
                                            (<span>{i.tag}</span>)
                                            :
                                            (<input type="text" className='input-in-table' ref={inputRef} onKeyUp={(event) => {
                                                if (event.key === 'Enter') {
                                                    save_tag(i.id, event.target.value);
                                                    setInputTagId(null);
                                                }
                                            }}/>)}
                                    </td>
                                    <td className={i.status}><span>{statuses[i.status]}</span></td>
                                    <td>{i.currency}</td>
                                    <td>{i.amount}</td>
                                    <td>{i.amount_in_usd}</td>
                                    <td>{i.comment}</td>
                                </tr>
                            ))
                    }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function TopUps() {
    const [topups, setTopups] = useState([]);
    const [filteredTopups, setFilteredTopups] = useState([]);
    const [sortConfig, setSortConfig] = useState({field: 'datetime', direction: 'desc', name: 'Новые'})
    const [filterConfig, setFilterConfig] = useState({
        banks: [...Object.keys(banks)],
        tags: [],
        statuses: [...Object.keys(statuses)],
        currency: [],
        amount: {min: '', max: '', in_usd: false},
    })
    const [filterVisible, setFilterVisible] = useState({
        banks: false,
        statuses: false,
    })
    const [modal, setModal] = useState(null)

    function sortArrow(field) {
        if (field === sortConfig.field) {
            return sortConfig.direction === 'asc' ? ' ↓' : ' ↑';
        }
        return ''
    }


    useEffect(() => {
        async function getTopups() {
            const response = await axiinstance.get('/admin/topups/');
            if (response.data) {
                setTopups(response.data);
            }
        }
        getTopups()
    }, []);

    useEffect(() => {
        let filtered = [...topups]

        if (filterConfig.amount.min !== '' || filterConfig.amount.max !== '') {
            const min_value = filterConfig.amount.min === '' ? 0 : parseFloat(filterConfig.amount.min)
            const max_value = filterConfig.amount.max === '' ? Infinity : parseFloat(filterConfig.amount.max)

            filtered = filtered.filter((i) => {
                let value
                if (filterConfig.amount.in_usd) {
                    value = parseFloat(i.amount_in_usd)
                } else {
                    value = parseFloat(i.amount);
                }
                return value >= min_value && value <= max_value;
            })
        }

        filtered = filtered.filter((i) => {
            return filterConfig.statuses.some((ii) => ii === i.status)
        })

        const sorted = [...filtered].sort((a, b) => {
            const valueA = sortConfig.field === 'datetime' ? new Date(a[sortConfig.field]) : a[sortConfig.field];
            const valueB = sortConfig.field === 'datetime' ? new Date(b[sortConfig.field]) : b[sortConfig.field];

            if (valueA < valueB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valueA > valueB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        })

        const formattedTopups = sorted.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''),
            amount: parseFloat(transaction.amount.toFixed(2)),
            amount_in_usd: parseFloat(transaction.amount_in_usd.toFixed(2)),
        }));

        setFilteredTopups(formattedTopups);

    }, [topups, sortConfig, filterConfig]);

    return (
        <div className='topups'>
            {modal && (
                <div className='modal' onClick={(event) => {
                    if (event.target === event.currentTarget) {
                        setModal(null)
                    }
                }}>
                    {modal === 'sort' && (
                        <div className="modal-tab" onClick={(event) => {
                            if (event.target.className !== 'inactive' && event.target.tagName === 'BUTTON') {
                                setModal(null);
                            }}}>
                            <h3>Сортировать по:</h3>
                            <button
                                className={sortConfig.field === 'datetime' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})}
                            >Новые</button>
                            <button
                                className={sortConfig.field === 'datetime' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'datetime', direction: 'asc', name: 'Старые'})}
                            >Старые</button>
                            <button
                                className={sortConfig.field === 'amount' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})}
                            >Сумма больше</button>
                            <button
                                className={sortConfig.field === 'amount' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount', direction: 'asc', name: 'Сумма меньше'})}
                            >Сумма меньше</button>
                            <button
                                className={sortConfig.field === 'amount_in_usd' && sortConfig.direction === 'desc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})}
                            >Сумма $ больше</button>
                            <button
                                className={sortConfig.field === 'amount_in_usd' && sortConfig.direction === 'asc' ? 'inactive' : ''}
                                onClick={() => setSortConfig({field: 'amount_in_usd', direction: 'asc', name: 'Сумма $ меньше'})}
                            >Сумма $ меньше</button>
                        </div>
                    )}
                    {modal === 'filter' && (
                        <div className='modal-tab filter'>
                            <div className='amount'>
                                <h3>Сумма</h3>
                                <div className='checkbox' onClick={() => {
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, in_usd: !filterConfig.amount.in_usd}})
                                }}>
                                    <input type="checkbox" checked={filterConfig.amount.in_usd}/>
                                    <p>в долларах</p>
                                </div>
                                От: <input type="text" className='input-text' value={filterConfig.amount.min} onChange={(event) => {
                                if (/^(\d*|\d+[,.]\d*)$/.test(event.target.value)) {
                                    const new_value = event.target.value.replace(/,/, '.')
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, min: new_value}})
                                }}}
                            /> до: <input type="text" className='input-text' value={filterConfig.amount.max} onChange={(event) => {
                                if (/^(\d*|\d+[,.]\d*)$/.test(event.target.value)) {
                                    const new_value = event.target.value.replace(/,/, '.')
                                    setFilterConfig({...filterConfig, amount: {...filterConfig.amount, max: new_value}})
                                }}}
                            />
                            </div>
                            <div className={`status${!filterVisible.statuses ? ' minimized' : ''}`}>
                                <h3
                                    onClick={() => setFilterVisible({
                                        ...filterVisible,
                                        statuses: !filterVisible.statuses
                                    })}
                                >Статус</h3>
                                {filterVisible.statuses &&
                                    <>
                                        {Object.keys(statuses).map(status => (
                                            <div className={`checkbox ${status}`} onClick={() => {
                                                if (filterConfig.statuses.some(i => i === status)) {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        statuses: filterConfig.statuses.filter((i) => i !== status)
                                                    });
                                                } else {
                                                    setFilterConfig({
                                                        ...filterConfig,
                                                        statuses: [...filterConfig.statuses, status]
                                                    });
                                                }
                                            }}>
                                                <input type="checkbox"
                                                       checked={filterConfig.statuses.some((i) => i === status)}/>
                                                <p>{statuses[status]}</p>
                                            </div>
                                        ))}
                                    </>
                                }
                            </div>
                        </div>
                    )}
                </div>
            )}
            <div className='filter_and_sort'>
                <button className='sort' onClick={() => setModal('sort')}>
                    <svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16' fill='currentColor'>
                        <path d='M 4.207,-2.798598e-8 0,4.207 1.414,5.621 3.207,3.828 v 10.586 h 2 V 3.828 L 7,5.621 8.414,4.207 Z M 11.207,14.828 7,10.621 8.414,9.207 10.207,11 V 0.41399997 h 2 V 11 L 14,9.207 l 1.414,1.414 z'/>
                    </svg>
                    &nbsp;{sortConfig.name}
                </button>
                <button className='filter' onClick={() => setModal('filter')}>
                    Фильтры
                </button>
            </div>
            <div className='table'>
                <table>
                    <thead>
                    <tr>
                        <th
                            onClick={() => {
                                if (sortConfig.field === 'datetime') {
                                    if (sortConfig.direction === 'asc') {
                                        setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                    } else {
                                        setSortConfig({field: 'datetime', direction: 'asc', name: 'Старые'})
                                    }
                                } else {
                                    setSortConfig({field: 'datetime', direction: 'desc', name: 'Новые'})
                                }
                            }}
                        >Дата{sortArrow('datetime')}</th>
                        <th>Пользователь</th>
                        <th>Метка</th>
                        <th>Статус</th>
                        <th
                            onClick={() => {
                                if (sortConfig.field === 'amount') {
                                    if (sortConfig.direction === 'asc') {
                                        setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                    } else {
                                        setSortConfig({field: 'amount', direction: 'asc', name: 'Сумма меньше'})
                                    }
                                } else {
                                    setSortConfig({field: 'amount', direction: 'desc', name: 'Сумма больше'})
                                }
                            }}
                        >Сумма{sortArrow('amount')}</th>
                        <th
                            onClick={() => {
                                if (sortConfig.field === 'amount_in_usd') {
                                    if (sortConfig.direction === 'asc') {
                                        setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})
                                    } else {
                                        setSortConfig({field: 'amount_in_usd', direction: 'asc', name: 'Сумма $ меньше'})
                                    }
                                } else {
                                    setSortConfig({field: 'amount_in_usd', direction: 'desc', name: 'Сумма $ больше'})
                                }
                            }}

                        >Сумма ${sortArrow('amount_in_usd')}</th>
                    </tr>
                    </thead>
                    <tbody>
                        {filteredTopups.length > 0 &&
                            filteredTopups.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.datetime}</td>
                                    <td>{i.user}</td>
                                    <td>{i.tag}</td>
                                    <td className={i.status}><span>{statuses[i.status]}</span></td>
                                    <td>{i.amount}</td>
                                    <td>{i.amount_in_usd}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function Users() {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);

    useEffect(() => {
        async function getUsers() {
            const response = await axiinstance.get('/admin/users/');
            if (response.data) {
                setUsers(response.data);
            }
        }
        getUsers()
    }, []);

    useEffect(() => {
        const formattedUsers = users.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''),
        }));


        setFilteredUsers(formattedUsers);

    }, [users])

    return (
        <div className='users'>
            <div className='table'>
                <table>
                    <thead>
                    <tr>
                        <th>Дата регистрации</th>
                        <th>Имя</th>
                        <th>Username</th>
                        <th>Баланс</th>
                    </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.length > 0 &&
                            filteredUsers.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.datetime}</td>
                                    <td>{i.name}</td>
                                    <td>{i.username}</td>
                                    <td>{i.balance}</td>
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
    const [currencies, setCurrencies] = useState([]);
    const [filteredCurrencies, setFilteredCurrencies] = useState([]);
    const [modal, setModal] = useState(false);
    const [modalForm, setModalForm] = useState({
        name: '',
        code: '',
        symbol: '',
        percent: '',
        min_amount: '',
        commission_step: ''
    });
    const [zeroErrors, setZeroErrors] = useState(false);

    function changeModalValue(event) {
        let className = event.target.className;
        let value = event.target.value;

        if (className === 'percent') {
            value = value.replace(/,/, '.');
            if (/^([+\d-]*|[+\d-]+\.\d*)$/.test(value)) {
                setModalForm({ ...modalForm, [className]: value });
            }
        }
        else if (className === 'min_amount' || className === 'commission_step') {
            value = value.replace(/,/, '.');
            if (/^(\d*|\d+\.\d*)$/.test(value)) {
                setModalForm({ ...modalForm, [className]: value });
            }
        }
        else {
            setModalForm({ ...modalForm, [className]: value });
        }
         setZeroErrors(Object.values(modalForm).every(value => value !== ""))
    }

    async function createButton() {
        await setZeroErrors(Object.values(modalForm).every(value => value !== ""))
        if (zeroErrors) {
            await axiinstance.post('admin/create_currency/', modalForm)
            setModal(false)
        }
    }

    async function handleKeyDown(event) {
        if (event.key === 'Escape' && modal) {
            setModal(false)
        }
    }

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        async function getCurrencies() {
            const response = await axiinstance.get('/admin/currencies/');
            if (response.data) {
                setCurrencies(response.data);
            }
        }
        getCurrencies()
    }, []);

    useEffect(() => {
        const formattedCurrencies = currencies.map((transaction) => ({
            ...transaction,
            datetime: new Date(transaction.datetime).toLocaleString('ru-RU', {
                hour12: false,
            }).replace(/,/g, ''),
        }));


        setFilteredCurrencies(formattedCurrencies);

    }, [currencies])

    return (
        <div className='currencies'>
            <div className='table'>
                <table>
                    <thead>
                    <tr>
                        <th>Название</th>
                        <th>Код</th>
                        <th>Символ</th>
                        <th>Курс</th>
                        <th>Процент</th>
                        <th>Минимальная сумма</th>
                        <th>Ступень комиссии</th>
                    </tr>
                    </thead>
                    <tbody>
                        {filteredCurrencies.length > 0 &&
                            filteredCurrencies.map((i) => (
                                <tr key={i.id}>
                                    <td>{i.name}</td>
                                    <td>{i.code}</td>
                                    <td>{i.symbol}</td>
                                    <td>{i.rate}</td>
                                    <td>{i.percent}</td>
                                    <td>{i.min_amount}</td>
                                    <td>{i.commission_step}</td>
                                </tr>
                            ))
                        }
                    </tbody>
                </table>
            </div>
            {modal ? (
                    <div className='modal' onClick={() => setModal(false)}>
                        <div
                            className='modal-tab'
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h3>Новая валюта</h3>
                            <div className='input-group'>
                                <p>Название валюты</p>
                                <input
                                    type="text"
                                    className='name'
                                    value={modalForm.name}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Код валюты</p>
                                <input
                                    type="text"
                                    className='code'
                                    value={modalForm.code}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Символ</p>
                                <input
                                    type="text"
                                    className='symbol'
                                    value={modalForm.symbol}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Процент</p>
                                <input
                                    type="text"
                                    className='percent'
                                    value={modalForm.percent}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Минимальная сумма</p>
                                <input
                                    type="text"
                                    className='min_amount'
                                    value={modalForm.min_amount}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <div className='input-group'>
                                <p>Ступень комиссии</p>
                                <input
                                    type="text"
                                    className='commission_step'
                                    value={modalForm.commission_step}
                                    onChange={changeModalValue}
                                />
                            </div>
                            <button
                                className={zeroErrors ? '' : 'inactive'}
                                onClick={createButton}
                            >
                                Создать
                            </button>
                        </div>
                    </div>
            ) : (
                <button className='create-currency' onClick={() => setModal(true)}>
                    Создать новую валюту
                </button>
            )}
        </div>
    )
}

export default function Admin() {
    const [auth, setAuth] = useState(null);
    const [activeLabel, setActiveLabel] = useState(null);

    const navigate = useNavigate()
    const location = useLocation();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                await axiinstance('admin/check_auth/')
                setAuth(true)
            } catch {
                setAuth(false)
            }
        }
        checkAuth()
    }, [])

    useEffect(() => {
        const currentPath = location.pathname.split('/').pop(); // Получаем последний сегмент URL
        if (['stats', 'withdraws', 'topups', 'users', 'currencies'].includes(currentPath)) {
            setActiveLabel(currentPath);
        }
    }, [location]);

    const changeLabel = (label) => {
        setActiveLabel(label);
        navigate(`/admin/${label}`);
    };


    return (
        <div className='admin'>
            {auth === false &&
                <Routes>
                    <Route path='auth' element={<Auth/>}/>
                    <Route path='*' element={<Navigate to='/admin/auth'/>}/>
                </Routes>
            }
            {auth === true &&
                <div className='container'>
                    <div className='labels'>
                        <button
                            className={`label stats ${activeLabel === 'stats' ? 'active' : ''}`}
                            onClick={() => {changeLabel('stats')}}
                        >Статистика</button>
                        <button
                            className={`label withdraws ${activeLabel === 'withdraws' ? 'active' : ''}`}
                            onClick={() => {changeLabel('withdraws')}}
                        >Выводы</button>
                        <button
                            className={`label topups ${activeLabel === 'topups' ? 'active' : ''}`}
                            onClick={() => {changeLabel('topups')}}
                        >Пополнения</button>
                        <button
                            className={`label users ${activeLabel === 'users' ? 'active' : ''}`}
                            onClick={() => {changeLabel('users')}}
                        >Пользователи</button>
                        <button
                            className={`label currencies ${activeLabel === 'currencies' ? 'active' : ''}`}
                            onClick={() => {changeLabel('currencies')}}
                        >Валюты</button>
                    </div>
                    <div className='tab'>
                        <Routes>
                            <Route path='stats' element={<Stats/>}/>
                            <Route path='withdraws' element={<Withdraws/>}/>
                            <Route path='topups' element={<TopUps/>}/>
                            <Route path='users' element={<Users/>}/>
                            <Route path='currencies' element={<Currencies/>}/>
                            <Route path='*' element={<Navigate to='/admin/stats'/>}/>
                        </Routes>
                    </div>
                </div>
            }
        </div>
    )
}