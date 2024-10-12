import React, { useState } from "react";

export const NotionPlayer = () => {
    return <div className="h-screen w-full bg-neutral-900 text-neutral-50">
        <Board />
    </div>;
}

//genero un componente para un tablero
const Board = () => {
    //genero un estado para cartas
    const [cards, setCards] = useState(DEFAULT_CARDS);

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

        </div>
    )
}

//genero un componente para columna que representara un equipo
const Column = ({ title, headingColor, column, cards, setCards}) => {
    //agregar estado vacio (momentaneamente)
    const [active, setActive] = useState(false)

    //filtrar player cards
    const filteredCards = cards.filter((c) => {
        // console.log(`Comparando: team_id = ${c.team_id}, column = ${column}`);
        // por alguna razon al regresar el elemento no funcionaba hasta que hice un cast a column por numero
        //agrego la condicionante para igualar el elemento en los casos de team_id=null
        return (c.team_id === Number(column)) || (c.team_id === null && Number(column) === 0)
    })

    return (
        <div className="w-56 shrink-0 border-solid border-2 border-indigo-600 p-1">
            <div className="mb-3 flex items-center justify-between">
                <h3 className={ `font-medium ${headingColor}`}>{title}</h3>
                <span className="rounded text-sm text-neutral-400"><small>players number: </small>{filteredCards.length}</span>
            </div>
            {/* div para cards de jugadores */}
            <div className={`h-full w-full transition-colors ${active  ? "bg-neutral-800/50" : "bg-neutral-800/0"}`}>
                {/* aqui pintare la carta de los jugadores */}
                {filteredCards.map((card) => {
                    /* ...c es una propagacion es un equivalente a agregar n numero de parametros */
                    return <Card key={card.id} {...card} />
                })}
            </div>
        </div>
    )
}

//Componente Card
const Card = ({id, team_id, name, age, position}) => {
    return <>
        <div>
            <p className="text-sm text-neutral-100">
                {name}
            </p>
        </div>
    </>
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
