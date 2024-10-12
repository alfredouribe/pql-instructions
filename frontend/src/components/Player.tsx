import React, { useEffect, useState } from "react";

//crer interfaz de jugador
interface Player {
    id: number;
    name: string;
    age: number;
    position: string;
    team_id?: number; //con esta instruccion el equipo es opcional
}

interface PlayerProps{
    players: Player[]; //lista de jugadores
    onRemove: (playerId: number) => void; //funcion para eliminar jugador
    teamId: number; //id del equipo al que se asignaran los jugadores
}

const apiKey = process.env.REACT_APP_API_KEY //importo api key de unsplash para obtener imagenes
const siteSplash = `https://api.unsplash.com/photos/random?client_id=${apiKey}&query=`

const Player: React.FC<PlayerProps> = ({players, onRemove, teamId}) => {
    //variable que contendra la url de la imagen

    const [images, setImages] = useState<{ [key: string]: string }>({}) //esto es para almacenar imagenes en un objeto usando el nombre del jugador
    
    useEffect(() => {
        //funcion para obtener la imagen
        const fetchImages = async()=>{
            try{
                const fetchedImages = await Promise.all(
                    players.map(async (player) => {
                        const response = await fetch(siteSplash + encodeURIComponent(player.name))
                        const data = await response.json();
                        return { name: player.name, url: data.urls.regular }
                    })
                )
                console.log(images)
                //objeto imagenes
                const newImages: { [key: string]: string } = {};
                fetchedImages.forEach((img) => {
                    newImages[img.name] = img.url;
                });

                setImages(newImages)//actualizar estado
            }catch(error){
                console.log(error)
            }
        }

        fetchImages() //llamo la funcion

        /* queria sacar imagenes de personas random con el nombre  del jugador, pero la peticion api tiene un limite de pocas consultas 
            asi que intercambiare por el placeholder de imagenes
            https://via.placeholder.com/100x200.png
        */
    }, []) //se debe poner un arreglo vacio, aun no se porque

    return (
        <div>
            <h2>Available Players</h2>
            <ul>
                {players.map((player) => (
                    <li key={player.id}>
                        <img src={'https://via.placeholder.com/150x150.png/000000?text=' + encodeURIComponent(player.name)} alt={player.name}/>
                        {player.name} - {player.age} - {player.position}
                        {player.team_id ? (
                            <span> (Assigned to Team ID: {player.team_id})</span> // Muestra si el jugador ya está asignado
                        ) : (
                            <span> (Unassigned)</span> // Indica que el jugador no está asignado a ningún equipo
                        )}
                        <button onClick={() => onRemove(player.id)}>Remove</button>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default Player;