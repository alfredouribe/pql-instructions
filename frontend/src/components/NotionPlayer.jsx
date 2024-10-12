import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaFire, FaPlus, FaTrash  } from "react-icons/fa";
import { GiLunarWand } from "react-icons/gi";
import { ImMagicWand } from "react-icons/im";

export const NotionPlayer = () => {
    return <div className="h-screen w-full bg-neutral-900 text-neutral-50">
        <Board />
    </div>;
}

//genero un componente para un tablero
const Board = () => {
    //genero un estado para cartas
    const [cards, setCards] = useState(DEFAULT_CARDS);

    //aqui hare la consulta con axios/fetch para mandar a llamar las cards
    //para eso debo crear otro estado y defaultcards debe ser reemplazado primero por []
    //const [cards, setCards] = useState([]);
    return (
        <div className="flex h-full w-full gap-3 overflow-scroll p-12">
            <Column
                title = "No Team"
                column = "0"
                headingColor = "text-gray-500 "
                cards = {cards}
                setCards= {setCards}
            />

            <Column
                title = "Team 1"
                column = "1"
                headingColor = "text-red-500"
                cards = {cards}
                setCards= {setCards}
            />

            <Column
                title = "Team 2"
                column = "2"
                headingColor = "text-green-500"
                cards = {cards}
                setCards= {setCards}
            />

            <Column
                title = "Team 3"
                column = "3"
                headingColor = "text-yellow-500"
                cards = {cards}
                setCards= {setCards}
            />

            <Column
                title = "Team 4"
                column = "4"
                headingColor = "text-blue-500 "
                cards = {cards}
                setCards= {setCards}
            />

            <BurnBarrel setCards={setCards} />

        </div>
    )
}

//genero un componente para columna que representara un equipo
const Column = ({ title, headingColor, column, cards, setCards}) => {
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
        console.log(cardData)

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

    //filtrar player cards
    const filteredCards = cards.filter((c) => {
        // console.log(`Comparando: team_id = ${c.team_id}, column = ${column}`);
        // por alguna razon al regresar el elemento no funcionaba hasta que hice un cast a column por numero
        //agrego la condicionante para igualar el elemento en los casos de team_id=null
        return (c.team_id === Number(column)) || (c.team_id === null && Number(column) === 0)
    })

    return (
        <div className="w-56 shrink-0 border-solid border-2 border-indigo-600 p-1" key={column}>
            <div className="mb-3 flex items-center justify-between">
                <h3 className={ `font-medium ${headingColor}`}>{title}</h3>
                <span className="rounded text-sm text-neutral-400"><small>players number: </small>{filteredCards.length}</span>
            </div>
            {/* div para cards de jugadores */}
            <div 
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDragEnd}
                className={`h-full w-full transition-colors ${active  ? "bg-neutral-800/50" : "bg-neutral-800/0"}`}>
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
    return <>
        <DropIndicator key={team_id} beforeId={id} column={team_id}/>
        {/* cursor grab cambia el cursor a manita, cursor grabbing cambia el cursor a manita agarrando */}
        {/* draggable es una propiedad nativa de html */}
        <motion.div 
            layout
            layoutId={id}
            className="cursor-grab rounded border border-neutral-700 bg-neutral-800 p-3 active:cursor-grabbing"
            draggable="true"
            onDragStart={(e) => handleDragStart(e,{ id, name, age, position, team_id})}
        >
            <p className="text-sm text-neutral-100">
                {name}
            </p>
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

    const handleDragEnd = (e) => {
        //aqui hare el fetch/axios para eliminar el jugador
        const cardId =e.dataTransfer.getData("cardId")
        setActive(false)
        console.log("deleting" + cardId)
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDragEnd}
            className={`mt-10 grid h-56 w-56 shrink-0 place-content-center rounded border text-3xl ${
                active
                ? "border-red-800 bg-red-800/20 text-red-500"
                : "border-neutral-500 bg-neutral-500/20 text-neutral-500"
            }`}
        >
            {active ? <FaFire className="animate-bounce"/> : <GiLunarWand />}
        </div>
    )
}

const AddCard = ({column, setCards}) => {
    const [text, setText] = useState("")
    const [adding, setAdding] = useState(false)

    const handleSubmit = (e) => {
        e.preventDefault()

        const newCard = {
            //aqui colocare la funcion para agregar nuevo jugador a traves de la api
        }
    }
    return (
        <>
            {adding ? (
                <motion.form layout className="p-1 bg-violet-200/20" onSubmit={handleSubmit}>
                    <input type="text" placeholder="name" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"/>
                    <input type="number" placeholder="age" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"/>
                    <input type="text" placeholder="position" required
                    className="w-full rounded border border-violet-400 bg-violet-400/20 p-3 text-sm text-neutral-50 placeholder-violet-300 focus:outline-0 mb-1"/>

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
                            <span>Add</span>
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
                <span>Add Player</span>
                <FaPlus/><ImMagicWand  />
            </motion.button> }
        </>
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
