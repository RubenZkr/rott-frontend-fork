import React from 'react';
import AppBarButton from '@/components/AppBar/AppBarButton';
import AppShell from '@/components/AppShell';
import "@fontsource/lato";

export default function GenerateQuiz() {
    return (  
        <AppShell>{{
            appBarButtons: [
                <AppBarButton onClick={() => alert("test!")}>Begin opnieuw</AppBarButton>,
            ],
            body: <>
                <h2>Nieuwe quiz</h2>
            </>
        }}</AppShell>
    )
};
