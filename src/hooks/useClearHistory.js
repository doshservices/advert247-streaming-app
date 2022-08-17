import { useContext } from 'react';
import { Context as RiderContext } from '../context/RiderContext';
import { Context as TriviaContext } from '../context/TriviaContext';
import { Context as VodContentContext } from '../context/VodContentContext';


export default () => {

    const { clearRider } = useContext(RiderContext);
    const { clearQuizHistory } = useContext(TriviaContext);
    const { clearPlaylistHistory } = useContext(VodContentContext);

    const clearHistory = () => {
        // console.log('clear works');
        clearRider();
        clearQuizHistory();
        clearPlaylistHistory();
    }

    return [ clearHistory ]
}