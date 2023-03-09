import React    from 'react';

import { 
    Link 
}               from 'react-router-dom'

const MemberQueryResultRow = (prop) => {
    const member = prop.member;

    return (
            <tr>
                <td>
                    <Link to={`/admin/member?id=${member.id}`}>{member.last_name}</Link>
                </td>
                <td>
                    {member.first_name}
                </td>
                <td>
                    { member.label }
                </td>
                <td>{
                    new Intl.DateTimeFormat("ISO", 
                        {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit"
                        }
                    ).format(new Date(member.updated_at))}                    
                </td>
            </tr>
    )
}

export default MemberQueryResultRow;