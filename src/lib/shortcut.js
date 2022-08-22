export const shortcut = (node, params) => {
    let handler;
    const removeHandler = () => window.removeEventListener('keydown', handler), setHandler = () => {
        removeHandler();
        if (!params)
            return;
        if (typeof params.code == "string") {
            handler = (e) => {
                if ((!!params.alt != e.altKey) ||
                    (!!params.shift != e.shiftKey) ||
                    (!!params.control != (e.ctrlKey || e.metaKey)) ||
                    params.code != e.code)
                    return;
                e.preventDefault();
                params.callback ? params.callback(e.code) : node.click();
            };
            window.addEventListener('keydown', handler);
        } else {
            for ( const code of params.code) {
                handler = (e) => {
                    if ((!!params.alt != e.altKey) ||
                        (!!params.shift != e.shiftKey) ||
                        (!!params.control != (e.ctrlKey || e.metaKey)) ||
                        code != e.code)
                        return;
                    e.preventDefault();
                    params.callback ? params.callback(e.code) : node.click();
                };
                window.addEventListener('keydown', handler);
                
            }
            
            

        }

        


    };
    setHandler();
    return {
        update: setHandler,
        destroy: removeHandler,
    };

};
