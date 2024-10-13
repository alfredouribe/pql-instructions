import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaFire, FaPlus, FaTrash, FaUserTie } from "react-icons/fa";
import { GiLunarWand } from "react-icons/gi";
import { ImMagicWand } from "react-icons/im";
import axios from "axios";
import { SPECIAL_ABILITIES, TEAM_COLOR } from "../constants";

export const NotionPlayer = () => {
    return <div className="h-screen w-full bg-neutral-900 text-neutral-50"
        style={{
            backgroundImage: `url('https://static1.srcdn.com/wordpress/wp-content/uploads/2024/09/quidditch-champions-world-cup-stadium-crowd.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            position: 'absolute',
            zIndex: -1
        }}>
        <Board />
    </div>;
}

//genero un componente para un tablero
const Board = () => {
    //genero un estado para cartas
    //const [cards, setCards] = useState([])
    const [cards, setCards] = useState([]);
    const [teams, setTeams] = useState([])
    //aqui hare la consulta con axios/fetch para mandar a llamar las cards
    //para eso debo crear otro estado y defaultcards debe ser reemplazado primero por []
    //const [cards, setCards] = useState([]); DEFAULT_CARDS

    useEffect(()=> {
        const fetchCards = async() => {
            try {
                const response = await axios.get('http://localhost:3001/api/players')
                setCards(response.data)
                
            }catch(error){
                console.log(error)
            }
        }

        fetchCards()
    }, [])


    useEffect(() => {
        const fetchTeams = async() => {
            try {
                const response = await axios.get('http://localhost:3001/api/teams')
                setTeams(response.data)
            }catch(error){
                console.log(error)
            }
        }

        fetchTeams()
    }, [])


    

    return (
        <div className="flex h-full w-full gap-3 overflow-scroll p-12">
            
            <Column
                title = "Available"
                column = "0"
                headingColor = "text-white-500 "
                cards = {cards}
                setCards= {setCards}
                slogan = "I am ready to play"
            />

            {teams.map((team) => {
                return(
                    <Column
                        title = {team.name}
                        column = {team.id}
                        headingColor = "text-white-500 "
                        cards = {cards}
                        setCards= {setCards}
                        slogan = {team.slogan}
                    />
                )
                
            })}

            <div>
                <BurnBarrel setCards={setCards} />
                <AddTeam setTeams={setTeams} setCards={setCards} cards={cards} teams={teams}/>
            </div>
        </div>
    )
}

//genero un componente para columna que representara un equipo
const Column = ({ title, headingColor, column, cards, setCards, slogan}) => {
    //agregar estado vacio (momentaneamente)
    const [active, setActive] = useState(false)

    //agregar funcionalidad para dragStart
    const handleDragStart = (e, card) => {
        console.log(card.name)
        //aqui se puede guardar todo lo necesario en dataTransfer
        e.dataTransfer.setData("cardId", card.id)
        e.dataTransfer.setData("name", card.name)
        e.dataTransfer.setData("position", card.position)
        e.dataTransfer.setData("age", card.age)
        e.dataTransfer.setData("cardData", JSON.stringify(card));
        console.log(card)
        console.log(e.dataTransfer.getData("cardData"))
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        highlightIndicator(e)
        setActive(true)
    }

    const highlightIndicator = (e) => {
        const indicators = getIndicators()
        clearHighlights(indicators)
        const el = getNearestIndicator(e, indicators)

        el.element.style.opacity = "1"
    }

    const clearHighlights = (els) => {
        const indicators = els || getIndicators()

        indicators.forEach((i) => {
            i.style.opacity = "0"
        })
    }

    const getNearestIndicator = (e, indicators) => {
        const DISTANCE_OFFSET = 50

        const el = indicators.reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect()
                const offset = e.clientY - (box.top + DISTANCE_OFFSET)

                if(offset < 0 && offset > closest.offset){
                    return {offset: offset, element: child}
                }else{
                    return closest
                }
            },{
                offset: Number.NEGATIVE_INFINITY,
                element: indicators[indicators.length - 1]
            }
        )

        return el
    }

    const getIndicators = () => {
        return Array.from(document.querySelectorAll(`[data-column="${column}"]`))
    }

    const handleDragLeave = () => {
        setActive(false)
        clearHighlights()
    }

    const handleDragEnd = (e) => {
        e.preventDefault()
        setActive(false)
        clearHighlights()

        const cardId = e.dataTransfer.getData("cardId")
        const cardData = JSON.parse(e.dataTransfer.getData("cardData"));
        // console.log(JSON.parse(cardData))
        const indicators = getIndicators()

        const {element} = getNearestIndicator(e, indicators)

        const before = element.dataset.before || "-1"

        if(before !== cardId){
            let copy = [...cards]
            let cardToTransferIndex = copy.findIndex((c) => c.id === Number(cardId))
            let cardToTransfer = copy.find((c) => c.id === cardId)
            cardToTransfer = cardData
            copy.splice(cardToTransferIndex, 1);

            if(before === "-1"){
                copy.push({ ...cardToTransfer, team_id: Number(column) })
            }else{
                const insertAtIndex = copy.findIndex((el) => el.id === Number(before))
                if (insertAtIndex === -1) return

                copy.splice(insertAtIndex, 0, { ...cardToTransfer, team_id: Number(column) })
            }
            
            //const moveToBack = before === "-1"

            // if(moveToBack){
            //     copy.push(cardToTransfer)
            // }else{
            //     const insertAtIndex = copy.findIndex((el) => el.id === before)
            //     if(insertAtIndex === undefined) return;

            //     copy.splice(insertAtIndex, 0, cardToTransfer)
            // }

            setCards(copy)
            //aqui debo actualizar el nuevo equipo del jugador
        }

        
    }

    const deleteTeam = async () => {
        try{
            //se esperaba que al eliminar un team los jugadores que lo incluyan actualicen automaticamente a team_id=null
            //podria ser una mejora en el back
            const response = await axios.delete(`http://localhost:3001/api/teams/${column}`)
            window.location.reload()
        }catch(error){
            console.log(error)
        }
    }

    //filtrar player cards
    const filteredCards = cards.filter((c) => {
        // console.log(`Comparando: team_id = ${c.team_id}, column = ${column}`);
        // por alguna razon al regresar el elemento no funcionaba hasta que hice un cast a column por numero
        //agrego la condicionante para igualar el elemento en los casos de team_id=null
        return (c.team_id === Number(column)) || (c.team_id === null && Number(column) === 0)
    })
    
    return (
        <div className="w-56 shrink-0 border-solid border-t-2 border-indigo-600 p-1" key={column}>
            <div className="mb-3 grid flex items-center justify-between bg-gray-800 bg-opacity-70 ">
                <h3 className={ `font-medium ${TEAM_COLOR[title] ?? 'textg-white'}`}>{title}</h3>
                <span className="rounded text-sm text-neutral-400"><small>Number of players: </small>{filteredCards.length}</span>
                <span style={{fontSize: '10px'}}>{slogan}</span>

                <div
                    layout
                    className="flex items-center justify-between cursor-pointer"
                    onClick={deleteTeam}
                >
                    <FaTrash  />
                    <span className="mt-2 text-xs cursor-pointer">Depulso Team</span>
                </div>
            </div>
            {/* div para cards de jugadores */}
            <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDragEnd}
                className={`h-full overflow-y-scroll w-full transition-colors p-1  ${active  ? "bg-neutral-800/50" : "bg-gray-800 bg-opacity-70"}`}>
                {/* aqui pintare la carta de los jugadores */}
                {filteredCards.map((card) => {
                    /* ...c es una propagacion es un equivalente a agregar n numero de parametros */
                    return <Card key={card.id} {...card} 
                    handleDragStart={handleDragStart}
                    />
                })}
                <DropIndicator beforeId="-1" column={column}/>

                <AddCard column={column} setCards={setCards} />
            </div>
        </div>
    )
}

//Componente Card
const Card = ({id, team_id, name, age, position, handleDragStart}) => {
    const getSpecialAbility = (position, id) => {
        const abilityIndex = id % 2
        return SPECIAL_ABILITIES[position][abilityIndex]
    }
    return <>
        <DropIndicator key={team_id} beforeId={id} column={team_id}/>
        {/* cursor grab cambia el cursor a manita, cursor grabbing cambia el cursor a manita agarrando */}
        {/* draggable es una propiedad nativa de html */}
        <motion.div 
            layout
            layoutId={id}
            className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing h-25 grid grid-cols-3 gap-4 content-center"
            draggable="true"
            onDragStart={(e) => handleDragStart(e,{ id, name, age, position, team_id})}
        >
            <img src="https://cdn-icons-png.flaticon.com/512/3177/3177440.png" width="128" alt="" />
            <p className="text-sm text-neutral-100">
                <b>{name}</b>
                <br />
                <span style={{fontSize: '10px'}}>Age {age}</span>
                
            </p>
            
            <small className="text-sm text-neutral-100">
                <p>
                    <b>Position</b> {position}
                </p>
            </small>

            <span className="text-sm text-neutral-100">Special Ability</span>
            <span className="text-sm text-neutral-100">{getSpecialAbility(position, id)}</span>
        </motion.div>
    </>
}

//componente drop indicator
const DropIndicator = ({ beforeId, column}) => {
    return (
        <div
            data-before={beforeId || -1} //id para tarjeta en drag
            data-column={column} //columna para revisar indicadores a revisar
            className="my-0.5 h-0.5 w-full bg-violet-400 opacity-0"
        >

        </div>
    )
}

/* componente para eliminar cards */
const BurnBarrel = ({ setCards }) => {
    const [active, setActive] = useState(false) //este estado es el que hara cambiar la animacion, icono y color

    const handleDragOver = (e) => {
        e.preventDefault()
        setActive(true)
    }

    const handleDragLeave = () => {
        setActive(false)
    }

    const handleDragEnd = async (e) => {
        //aqui hare el fetch/axios para eliminar el jugador
        const cardId =e.dataTransfer.getData("cardId")
        
        console.log("deleting" + cardId)
        //verificar que exista un id en el evento
        if(cardId){
            try{
                await axios.delete(`http://localhost:3001/api/players/${cardId}`)
                setCards(prevCards => prevCards.filter(card => card.id !== parseInt(cardId)));
            }catch(error){
                console.log(error)
            }
        }else{
            console.log("Error")
        }

        setActive(false)
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDragEnd}
            className={`content-center mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
                active
                ? "border-green-800 bg-green-800/20 text-green-500"
                : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
            }`}
        >
            {active ? (<FaFire className="animate-bounce"/>) : (
                <div className="flex flex-col items-center justify-center">
                <GiLunarWand />
                <p className="mt-2 text-xl">Avada Kedabra</p>
                </div>
            )}
        </div>
    )
}

const AddCard = ({column, setCards}) => {
    const [text, setText] = useState("")
    const [adding, setAdding] = useState(false)
    const [name, setPlayerName] = useState("")
    const [age, setAge] = useState("")
    const [position, setPosition] = useState("")

    const handleSubmit = async (e) => {
        e.preventDefault()

        const newPlayer = {
            //aqui colocare la funcion para agregar nuevo jugador a traves de la api
            name,
            age,
            position,
            team_id: column
        }

        try{
            const response = await axios.post("http://localhost:3001/api/players", newPlayer)

            const addedPlayer = response.data
            setAdding(false)
            setCards((prevCards) => [...prevCards, addedPlayer]);
            setPlayerName("")
            setAge("")
            setPosition("")
        }catch(error){
            console.log(error)
        }
    }
    return (
        <>
            {adding ? (
                <motion.form layout className="p-1 bg-violet-200/20" onSubmit={handleSubmit}>
                    <input type="text" placeholder="name" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"
                    onChange={(e) => setPlayerName(e.target.value)}/>

                    <input type="number" placeholder="age" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"
                    onChange={(e) => setAge(e.target.value)}/>

                    <input type="text" placeholder="position" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"
                    onChange={(e) => setPosition(e.target.value)}/>

                    <div className="mt-1.5 flex items-center justify-end gap-1.5">
                        <button
                            onClick={() => setAdding(false)}
                            className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
                        >
                            <span>Flush</span>
                            <ImMagicWand  />
                        </button>
                    </div>
                </motion.form>
            ) : 
            <motion.button 
                layout
                onClick = {() => setAdding(true)}
                className = "flex w-full items-center gap-1.5 px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
            >
                <span>Accio Player</span>
                <FaUserTie /><ImMagicWand  />
            </motion.button> }
        </>
    )
}

const AddTeam = ({setTeams, setCards, cards, teams}) => {
    const [activeTeamForm, setTeamForm] = useState(false)

    const [name, setName] = useState("") //esto servira para capturar el nombre del equipo
    const [slogan, setSlogan] = useState("") //esto servira para capturar el slogan del equipo
    const [selectedCardIds, setSelectedCardIds] = useState("");

    const filteredCards = cards.filter((c) => {
        // solo cards que no tienen equipo
        return c.team_id === null
    })

    const onSubmit = async (e) => {
        e.preventDefault()

        const newTeam = {
            //aqui colocare la funcion para agregar nuevo jugador a traves de la api
            name,
            slogan,
            players: selectedCardIds //jugadores
        }

        try{
            const response = await axios.post("http://localhost:3001/api/teams", newTeam)

            //si obtuviera el ultimo elemento (necesito igualmente el id) podria hacer un push en los cards
            //de momento hare un refresh
            window.location.reload()
            setTeams((prevTeams) => [...prevTeams, newTeam]);


            setName("");
            setSlogan("");
            setSelectedCardIds([]);

        }catch(error){
            console.log(error)
        }
    }

    const handleCardSelection = (e) => {
        const options = e.target.options;
        const selectedValues = [];
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedValues.push(Number(options[i].value));
            }
        }
        setSelectedCardIds(selectedValues);
    };

    return (
        <div className="content-center mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl border-neutral-500 bg-neutral-500/20 text-neutral-500 hover:text-gray-100">
            <pre>{JSON.stringify(setCards, 0, 2)}</pre>
            {activeTeamForm ? (
                <motion.form layout className="p-1 bg-violet-200/20" onSubmit={onSubmit}>
                    <input type="text" placeholder="name of the team" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"
                    onChange={(e) => setName(e.target.value)}/>

                    <input type="text" placeholder="slogan" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"
                    onChange={(e) => setSlogan(e.target.value)}/>

                    <select
                        multiple={true}
                        value={selectedCardIds}
                        onChange={handleCardSelection}
                        className="w-full rounded border border-gray-400 bg-gray-800 p-3 text-sm text-gray-500 placeholder-gray-300 focus:outline-0 mb-1"
                    >
                        {filteredCards.map((card) => (
                            <option key={card.id} value={card.id}>
                                {card.name} 
                            </option>
                        ))}
                    </select>

                    <div className="mt-1.5 flex items-center justify-end gap-1.5">
                        <button
                            onClick={() => setTeamForm(false)}
                            className="px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-50"
                        >
                            Close
                        </button>

                        <button
                            type="submit"
                            className="flex items-center gap-1.5 rounded bg-neutral-50 px-3 py-1.5 text-xs text-neutral-950 transition-colors hover:bg-neutral-300"
                        >
                            <span>Flush</span>
                            <ImMagicWand  />
                        </button>
                    </div>
                </motion.form>
            ) : (

                <div
                    layout
                    onClick = {() => setTeamForm(true)}
                    className="flex flex-col items-center justify-center cursor-pointer"
                >
                    <ImMagicWand  />
                    <p className="mt-2 text-xl cursor-pointer">Accio Team</p>
                </div>

            )}
        </div>
    )
}
//obtengo cards de jugadores (TEMPORALMENTE SIN AXIOS/FETCH)

const DEFAULT_CARDS = [
    {
        "id": 1,
        "name": "Harry Potter",
        "age": 11,
        "position": "Seeker",
        "team_id": 1
    },
    {
        "id": 2,
        "name": "Hermione Granger",
        "age": 11,
        "position": "Chaser",
        "team_id": 1
    },
    {
        "id": 3,
        "name": "Ron Weasley",
        "age": 11,
        "position": "Keeper",
        "team_id": 1
    },
    {
        "id": 4,
        "name": "Draco Malfoy",
        "age": 11,
        "position": "Chaser",
        "team_id": null
    },
    {
        "id": 5,
        "name": "Cedric Diggory",
        "age": 17,
        "position": "Seeker",
        "team_id": null
    },
    {
        "id": 6,
        "name": "Cho Chang",
        "age": 16,
        "position": "Chaser",
        "team_id": 3
    },
    {
        "id": 7,
        "name": "Luna Lovegood",
        "age": 14,
        "position": "Chaser",
        "team_id": null
    },
    {
        "id": 8,
        "name": "Ginny Weasley",
        "age": 14,
        "position": "Chaser",
        "team_id": null
    },
]
