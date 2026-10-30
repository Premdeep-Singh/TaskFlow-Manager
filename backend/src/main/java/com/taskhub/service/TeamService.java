package com.taskhub.service;

import com.taskhub.model.Role;
import com.taskhub.model.Team;
import com.taskhub.model.User;
import com.taskhub.repo.mongo.TeamRepo;
import com.taskhub.repo.sql.UserRepo;
import com.taskhub.web.ApiException;
import com.taskhub.web.Dtos.MemberReq;
import com.taskhub.web.Dtos.TeamReq;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TeamService {
    private final TeamRepo teams;
    private final UserRepo users;   // MySQL: used to look up accounts by email

    public Team create(Long uid, TeamReq r) {
        User u = users.findById(uid).orElseThrow(() -> new ApiException(401, "Account not found"));
        Team t = new Team();
        t.setName(r.name().trim());
        t.setDescription(r.description());
        t.setOwnerId(uid);
        t.getMembers().add(new Team.Member(uid, u.getName(), u.getEmail(), Role.LEADER));
        return teams.save(t);
    }

    public List<Team> mine(Long uid) { return teams.findByMembersUserId(uid); }

    public Team get(String id) {
        return teams.findById(id).orElseThrow(() -> new ApiException(404, "Team not found"));
    }

    /** The caller's role in the team, or 403 if they are not a member. */
    public Role roleOf(Team t, Long uid) {
        return t.getMembers().stream().filter(m -> m.userId().equals(uid)).map(Team.Member::role).findFirst()
                .orElseThrow(() -> new ApiException(403, "You are not a member of this team"));
    }

    public Team addMember(Long uid, String teamId, MemberReq r) {
        Team t = get(teamId);
        if (roleOf(t, uid) != Role.LEADER) throw new ApiException(403, "Only a team leader can add members");
        User u = users.findByEmailIgnoreCase(r.email().trim()).orElseThrow(
                () -> new ApiException(404, "No account uses that email. Ask them to sign up first."));
        if (t.getMembers().stream().anyMatch(m -> m.userId().equals(u.getId())))
            throw new ApiException(409, u.getName() + " is already on this team");
        t.getMembers().add(new Team.Member(u.getId(), u.getName(), u.getEmail(), r.role()));
        return teams.save(t);
    }
}
